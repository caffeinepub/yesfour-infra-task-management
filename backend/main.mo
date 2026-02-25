import List "mo:core/List";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";
import Iter "mo:core/Iter";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Strict migration with clause for actor state
(with migration = Migration.run)
actor {
  // Mixin state for file storage
  include MixinStorage();

  // Mixin state for authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── User Profile ──────────────────────────────────────────────────────────

  type UserRole = { #admin; #manager; #employee };
  type AccountStatus = { #active; #inactive };

  type UserProfile = {
    name : Text;
    department : Text;
    role : UserRole;
    performancePoints : Int;
    accountStatus : AccountStatus;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save their profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Admin User Management ────────────────────────────────────────────────

  // Delete a user. Only admins can perform this operation.
  public shared ({ caller }) func deleteUser(user : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete users");
    };
    userProfiles.remove(user);
  };

  // Update a user's role. Only admins can perform this operation.
  public shared ({ caller }) func updateUserRole(user : Principal, newRole : UserRole) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update user roles");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        let updatedProfile = {
          profile with
          role = newRole;
        };
        userProfiles.add(user, updatedProfile);
      };
    };
  };

  // Toggle a user's account status (active/inactive). Only admins can perform this operation.
  public shared ({ caller }) func toggleUserAccountStatus(user : Principal, status : AccountStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update account status");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        let updatedProfile = {
          profile with
          accountStatus = status;
        };
        userProfiles.add(user, updatedProfile);
      };
    };
  };

  // Struct to hold aggregate user statistics
  type UserStats = {
    profile : UserProfile;
    totalTasks : Nat;
    tasksCompleted : Nat;
    performancePoints : Int;
  };

  // Query to get all users stats as admin
  public query ({ caller }) func getAllUsersStats() : async [UserStats] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all user stats");
    };
    let stats = List.empty<UserStats>();
    for ((principal, profile) in userProfiles.entries()) {
      stats.add({
        profile;
        totalTasks = 0;
        tasksCompleted = 0;
        performancePoints = profile.performancePoints;
      });
    };
    stats.toArray();
  };

  // ── Task Types ────────────────────────────────────────────────────────────

  type Department = {
    #construction;
    #marketing;
    #travelDesk;
    #accounts;
    #apartments;
  };

  type TaskPriority = {
    #high;
    #medium;
    #low;
  };

  type TaskStatus = {
    #red;
    #yellow;
    #blue;
    #green;
  };

  type ApprovalStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type Task = {
    taskId : Nat;
    title : Text;
    department : Department;
    assignedTo : Principal;
    description : Text;
    deadline : Time.Time;
    priority : TaskPriority;
    status : TaskStatus;
    proofFile : ?Storage.ExternalBlob;
    approvalStatus : ApprovalStatus;
    rejectionReason : ?Text;
    completionTime : ?Time.Time;
    performancePoints : Int;
  };

  module Task {
    public func compareByDeadline(task1 : Task, task2 : Task) : Order.Order {
      Int.compare(task1.deadline, task2.deadline);
    };
  };

  var lastTaskId = 0;

  let tasks = Map.empty<Nat, Task>();

  // ── Helper: apply deadline-based auto-red status ──────────────────────────

  func applyDeadlineCheck(task : Task) : Task {
    let now = Time.now();
    if (task.status != #green and now > task.deadline) {
      { task with status = #red };
    } else {
      task;
    };
  };

  // ── Task Endpoints ────────────────────────────────────────────────────────

  /// Create a task. Admin-only (admins represent managers in this system).
  public shared ({ caller }) func createTask(
    title : Text,
    department : Department,
    assignedTo : Principal,
    description : Text,
    deadline : Time.Time,
    priority : TaskPriority,
  ) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins/managers can create tasks");
    };

    let taskId = lastTaskId;
    let newTask : Task = {
      taskId;
      title;
      department;
      assignedTo;
      description;
      deadline;
      priority;
      status = #yellow;
      proofFile = null;
      approvalStatus = #pending;
      rejectionReason = null;
      completionTime = null;
      performancePoints = 0;
    };

    tasks.add(taskId, newTask);
    lastTaskId += 1;
    taskId;
  };

  /// Upload proof for a task. Only the assigned employee.
  public shared ({ caller }) func uploadProofFile(taskId : Nat, file : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can upload proof");
    };

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        if (task.assignedTo != caller) {
          Runtime.trap("Unauthorized: Only the assigned employee can upload proof");
        };
        // Cannot upload proof for an already-completed or overdue task
        let checkedTask = applyDeadlineCheck(task);
        if (checkedTask.status == #red) {
          tasks.add(taskId, checkedTask);
          Runtime.trap("Task deadline has passed; proof upload not allowed");
        };
        let updatedTask : Task = {
          checkedTask with
          proofFile = ?file;
          status = #blue;
        };
        tasks.add(taskId, updatedTask);
      };
    };
  };

  /// Approve a task. Admin-only (admins represent managers in this system).
  public shared ({ caller }) func approveTask(taskId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins/managers can approve tasks");
    };

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        let now = Time.now();
        let points : Int = if (now <= task.deadline) { 10 } else { -5 };
        let updatedTask : Task = {
          task with
          status = #green;
          approvalStatus = #approved;
          completionTime = ?now;
          performancePoints = points;
        };
        tasks.add(taskId, updatedTask);

        // Award performance points to the assigned employee's profile
        switch (userProfiles.get(task.assignedTo)) {
          case (null) {};
          case (?profile) {
            let updatedProfile : UserProfile = {
              profile with
              performancePoints = profile.performancePoints + points;
            };
            userProfiles.add(task.assignedTo, updatedProfile);
          };
        };
      };
    };
  };

  /// Reject a task. Admin-only (admins represent managers in this system).
  public shared ({ caller }) func rejectTask(taskId : Nat, reason : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins/managers can reject tasks");
    };

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        let updatedTask : Task = {
          task with
          status = #yellow;
          approvalStatus = #rejected;
          rejectionReason = ?reason;
        };
        tasks.add(taskId, updatedTask);
      };
    };
  };

  /// Get tasks for a specific user.
  /// Admins can query any user; a regular user can only query their own tasks.
  public query ({ caller }) func getTasksForUser(user : Principal) : async [Task] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own tasks");
    };

    let userTasks = List.empty<Task>();
    for ((_, task) in tasks.entries()) {
      if (task.assignedTo == user) {
        userTasks.add(applyDeadlineCheck(task));
      };
    };
    userTasks.toArray().sort(Task.compareByDeadline);
  };

  /// Get tasks assigned to the caller. Requires at least a registered user.
  public query ({ caller }) func getTasksForCaller() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view their tasks");
    };

    let userTasks = List.empty<Task>();
    for ((_, task) in tasks.entries()) {
      if (task.assignedTo == caller) {
        userTasks.add(applyDeadlineCheck(task));
      };
    };
    userTasks.toArray().sort(Task.compareByDeadline);
  };

  /// Admin dashboard: aggregate statistics.
  public query ({ caller }) func getAdminDashboard() : async {
    totalTasks : Nat;
    completedTasks : Nat;
    lateTasks : Nat;
    leaderboard : [(Principal, Int)];
  } {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view the dashboard");
    };

    var total = 0;
    var completed = 0;
    var late = 0;
    let pointsMap = Map.empty<Principal, Int>();

    for ((_, task) in tasks.entries()) {
      let checked = applyDeadlineCheck(task);
      total += 1;
      if (checked.status == #green) { completed += 1 };
      if (checked.status == #red) { late += 1 };

      // Accumulate performance points per employee
      let existing : Int = switch (pointsMap.get(checked.assignedTo)) {
        case (null) { 0 };
        case (?p) { p };
      };
      pointsMap.add(checked.assignedTo, existing + checked.performancePoints);
    };

    let leaderboardList = List.empty<(Principal, Int)>();
    for ((p, pts) in pointsMap.entries()) {
      leaderboardList.add((p, pts));
    };
    let leaderboardArray = leaderboardList.toArray().sort(
      func(a : (Principal, Int), b : (Principal, Int)) : Order.Order {
        Int.compare(b.1, a.1); // descending
      }
    );

    {
      totalTasks = total;
      completedTasks = completed;
      lateTasks = late;
      leaderboard = leaderboardArray;
    };
  };
};
