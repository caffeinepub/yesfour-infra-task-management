import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
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

  type OldTask = {
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
  };

  type NewTask = {
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

  type OldActor = {
    lastTaskId : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
    tasks : Map.Map<Nat, OldTask>;
  };

  type NewActor = {
    lastTaskId : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
    tasks : Map.Map<Nat, NewTask>;
  };

  public func run(old : OldActor) : NewActor {
    let newTasks = old.tasks.map<Nat, OldTask, NewTask>(
      func(_id, oldTask) {
        { oldTask with
          submittedAt = null;
          reviewedAt = null;
          reviewComment = null;
          finalStatus = null;
        };
      }
    );
    {
      lastTaskId = old.lastTaskId;
      userProfiles = old.userProfiles;
      tasks = newTasks;
    };
  };
};
