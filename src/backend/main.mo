import Text "mo:core/Text";
import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



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
    email : Text;
  };

  type UserSummary = {
    principal : Principal;
    name : Text;
    email : Text;
    department : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  func isAdminOrManager(caller : Principal) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true;
    };
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.role) {
          case (#admin) { true };
          case (#manager) { true };
          case (_) { false };
        };
      };
    };
  };

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

  /// Returns all active users (name, email, department, principal).
  /// Accessible by admins and managers only.
  public query ({ caller }) func getActiveUsers() : async [UserSummary] {
    if (not isAdminOrManager(caller)) {
      Runtime.trap("Unauthorized: Only admins and managers can access active users");
    };

    let entries = userProfiles.entries();
    let activeUsers : List.List<UserSummary> = List.empty<UserSummary>();

    for ((principal, profile) in entries) {
      if (profile.accountStatus == #active) {
        activeUsers.add({
          principal;
          name = profile.name;
          email = profile.email;
          department = profile.department;
        });
      };
    };

    activeUsers.toArray();
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
    #pendingReview;
  };

  type FinalStatus = {
    #pendingReview;
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
    proofSubmittedBy : ?Text;
    proofSubmittedByEmail : ?Text;
    submissionTimestamp : ?Time.Time;
    approvalStatus : ApprovalStatus;
    rejectionReason : ?Text;
    completionTime : ?Time.Time;
    performancePoints : Int;
    submittedAt : ?Time.Time;
    reviewedAt : ?Time.Time;
    reviewComment : ?Text;
    finalStatus : ?FinalStatus;
  };

  // Task as returned to frontend (filtered)
  type TaskResponse = {
    taskId : Nat;
    title : Text;
    department : Department;
    assignedTo : Principal;
    description : Text;
    deadline : Time.Time;
    priority : TaskPriority;
    status : TaskStatus;
    proofFile : ?Storage.ExternalBlob;
    proofSubmittedBy : ?Text;
    proofSubmittedByEmail : ?Text;
    submissionTimestamp : ?Time.Time;
    approvalStatus : ApprovalStatus;
    rejectionReason : ?Text;
    completionTime : ?Time.Time;
    performancePoints : Int;
    submittedAt : ?Time.Time;
    reviewedAt : ?Time.Time;
    reviewComment : ?Text;
    finalStatus : ?FinalStatus;
  };

  func compareByDeadline(task1 : TaskResponse, task2 : TaskResponse) : Order.Order {
    Int.compare(task1.deadline, task2.deadline);
  };

  var lastTaskId : Nat = 0;

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

  // ── Helper: convert Task to TaskResponse with proof field filtering ────────

  /// Converts Task to TaskResponse, conditionally exposing proof fields only to
  /// admins/managers or the assigned employee (task owner).
  func toTaskResponse(task : Task, caller : Principal) : TaskResponse {
    let allowProofFields = isAdminOrManager(caller) or (caller == task.assignedTo);

    {
      taskId = task.taskId;
      title = task.title;
      department = task.department;
      assignedTo = task.assignedTo;
      description = task.description;
      deadline = task.deadline;
      priority = task.priority;
      status = task.status;
      approvalStatus = task.approvalStatus;
      rejectionReason = task.rejectionReason;
      completionTime = task.completionTime;
      performancePoints = task.performancePoints;
      proofFile = if (allowProofFields) { task.proofFile } else { null };
      proofSubmittedBy = if (allowProofFields) { task.proofSubmittedBy } else { null };
      proofSubmittedByEmail = if (allowProofFields) { task.proofSubmittedByEmail } else { null };
      submissionTimestamp = if (allowProofFields) { task.submissionTimestamp } else { null };
      submittedAt = if (allowProofFields) { task.submittedAt } else { null };
      reviewedAt = if (allowProofFields) { task.reviewedAt } else { null };
      reviewComment = if (allowProofFields) { task.reviewComment } else { null };
      finalStatus = if (allowProofFields) { task.finalStatus } else { null };
    };
  };

  // ── Task Endpoints ────────────────────────────────────────────────────────

  /// Create a task. Accessible by admins and managers only.
  /// Accepts an email address as the assignee identifier.
  public shared ({ caller }) func createTask(
    title : Text,
    department : Department,
    assigneeEmail : Text,
    description : Text,
    deadline : Time.Time,
    priority : TaskPriority,
  ) : async Nat {
    if (not isAdminOrManager(caller)) {
      Runtime.trap("Unauthorized: Only admins/managers can create tasks");
    };

    let assignedTo = findPrincipalByEmail(assigneeEmail);

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
      proofSubmittedBy = null;
      proofSubmittedByEmail = null;
      submissionTimestamp = null;
      approvalStatus = #pending;
      rejectionReason = null;
      completionTime = null;
      performancePoints = 0;
      submittedAt = null;
      reviewedAt = null;
      reviewComment = null;
      finalStatus = null;
    };

    tasks.add(taskId, newTask);
    lastTaskId += 1;
    taskId;
  };

  /// Look up a principal by email address.
  /// Traps with a specific message if the user does not exist or is not active.
  func findPrincipalByEmail(email : Text) : Principal {
    let entries = userProfiles.entries();
    for ((principal, profile) in entries) {
      if (Text.equal(profile.email, email)) {
        switch (profile.accountStatus) {
          case (#active) { return principal };
          case (_) { Runtime.trap("User with this email is not active") };
        };
      };
    };
    Runtime.trap("User with this email does not exist.");
  };

  /// Upload proof for a task.
  /// Only the assigned employee (caller == assignedTo) may call this.
  /// The caller must also be a registered user (#user permission).
  public shared ({ caller }) func uploadProof(
    taskId : Nat,
    file : Storage.ExternalBlob,
  ) : async TaskResponse {
    // Must be a registered user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can upload proof");
    };

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        // Must be the assigned employee
        if (task.assignedTo != caller) {
          Runtime.trap("Unauthorized: Only the assigned employee can upload proof");
        };

        let checkedTask = applyDeadlineCheck(task);
        if (checkedTask.status == #red) {
          tasks.add(taskId, checkedTask);
          Runtime.trap("Task deadline has passed; proof upload not allowed");
        };

        let updatedTask : Task = {
          checkedTask with
          proofFile = ?file;
          status = #blue;
          approvalStatus = #pendingReview;
          submittedAt = ?Time.now();
        };
        tasks.add(taskId, updatedTask);
        toTaskResponse(updatedTask, caller);
      };
    };
  };

  /// Mark a task as complete (employee's final confirmation after proof upload).
  /// Only the assigned employee (caller == assignedTo) may call this.
  /// The caller must also be a registered user (#user permission).
  /// The task must already have a proofFile uploaded.
  public shared ({ caller }) func markComplete(
    taskId : Nat,
  ) : async TaskResponse {
    // Must be a registered user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can mark complete");
    };

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        // Must be the assigned employee
        if (task.assignedTo != caller) {
          Runtime.trap("Unauthorized: Only the assigned employee can mark complete");
        };

        // Proof must have been uploaded first
        switch (task.proofFile) {
          case (null) { Runtime.trap("You must upload proof first") };
          case (?_) {};
        };

        let now = Time.now();
        let updatedTask : Task = {
          task with
          status = #blue;
          approvalStatus = #pendingReview;
          // Only set submittedAt if not already set by uploadProof
          submittedAt = switch (task.submittedAt) {
            case (?existing) { ?existing };
            case (null) { ?now };
          };
        };
        tasks.add(taskId, updatedTask);
        toTaskResponse(updatedTask, caller);
      };
    };
  };

  /// Admin review of a task: approve or reject.
  /// Only admins may call this function.
  /// Rejection requires a non-empty reviewComment.
  public shared ({ caller }) func adminReviewTask(
    taskId : Nat,
    decision : FinalStatus,
    reviewComment : ?Text,
  ) : async TaskResponse {
    // Must be an admin
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can review tasks");
    };

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        switch (decision) {
          case (#approved) {
            let now = Time.now();
            let points : Int = if (now <= task.deadline) { 10 } else { -5 };
            let updatedTask : Task = {
              task with
              status = #green;
              approvalStatus = #approved;
              completionTime = ?now;
              performancePoints = points;
              reviewedAt = ?now;
              reviewComment = null;
              finalStatus = ?#approved;
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
          case (#rejected) {
            // Rejection requires a non-empty review comment
            let comment = switch (reviewComment) {
              case (null) {
                Runtime.trap("Rejection requires a non-empty review comment")
              };
              case (?c) {
                if (c.size() == 0) {
                  Runtime.trap("Rejection requires a non-empty review comment")
                };
                c
              };
            };
            let now = Time.now();
            let updatedTask : Task = {
              task with
              status = #yellow;
              approvalStatus = #rejected;
              reviewedAt = ?now;
              reviewComment = ?comment;
              finalStatus = ?#rejected;
            };
            tasks.add(taskId, updatedTask);
          };
          case (#pendingReview) {
            // #pendingReview is not a valid admin decision
            Runtime.trap("Invalid decision: use #approved or #rejected");
          };
        };
        toTaskResponse(tasks.get(taskId).unwrap(), caller);
      };
    };
  };

  /// Approve a task. Accessible by admins and managers only.
  public shared ({ caller }) func approveTask(taskId : Nat) : async () {
    if (not isAdminOrManager(caller)) {
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

  /// Reject a task. Accessible by admins and managers only.
  public shared ({ caller }) func rejectTask(taskId : Nat, reason : Text) : async () {
    if (not isAdminOrManager(caller)) {
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
  /// Admins/managers can view any user's tasks with full proof data.
  /// An employee can only view their own tasks (with proof data).
  /// No other caller may access this endpoint.
  public query ({ caller }) func getTasksForUser(user : Principal) : async [TaskResponse] {
    if (caller != user and not isAdminOrManager(caller)) {
      Runtime.trap("Unauthorized: Can only view your own tasks");
    };

    let userTasks = List.empty<TaskResponse>();
    for ((_, task) in tasks.entries()) {
      if (task.assignedTo == user) {
        let checked = applyDeadlineCheck(task);
        userTasks.add(toTaskResponse(checked, caller));
      };
    };
    userTasks.toArray().sort(compareByDeadline);
  };

  /// Get tasks assigned to the caller.
  /// Proof fields are visible because the caller is the assigned employee.
  public query ({ caller }) func getTasksForCaller() : async [TaskResponse] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view their tasks");
    };

    let userTasks = List.empty<TaskResponse>();
    for ((_, task) in tasks.entries()) {
      if (task.assignedTo == caller) {
        let checked = applyDeadlineCheck(task);
        userTasks.add(toTaskResponse(checked, caller));
      };
    };
    userTasks.toArray().sort(compareByDeadline);
  };

  /// Get all tasks. Accessible by admins and managers only.
  /// Proof fields are included because only admins/managers can call this.
  public query ({ caller }) func getAllTasks() : async [TaskResponse] {
    if (not isAdminOrManager(caller)) {
      Runtime.trap("Unauthorized: Only admins/managers can view all tasks");
    };

    let allTasks = List.empty<TaskResponse>();
    for ((_, task) in tasks.entries()) {
      let checked = applyDeadlineCheck(task);
      allTasks.add(toTaskResponse(checked, caller));
    };
    allTasks.toArray().sort(compareByDeadline);
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
