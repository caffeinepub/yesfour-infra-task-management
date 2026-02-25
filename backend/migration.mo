import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  // Old data types from previous version
  type OldTask = {
    taskId : Nat;
    title : Text;
    department : {
      #construction;
      #marketing;
      #travelDesk;
      #accounts;
      #apartments;
    };
    assignedTo : Principal;
    description : Text;
    deadline : Int;
    priority : {
      #high;
      #medium;
      #low;
    };
    status : {
      #red;
      #yellow;
      #blue;
      #green;
    };
    proofFile : ?Storage.ExternalBlob;
    approvalStatus : {
      #pending;
      #approved;
      #rejected;
    };
    rejectionReason : ?Text;
    completionTime : ?Int;
    performancePoints : Int;
  };

  type OldActor = {
    lastTaskId : Nat;
    tasks : Map.Map<Nat, OldTask>;
  };

  // New extended types
  type NewTask = {
    taskId : Nat;
    title : Text;
    department : {
      #construction;
      #marketing;
      #travelDesk;
      #accounts;
      #apartments;
    };
    assignedTo : Principal;
    description : Text;
    deadline : Int;
    priority : {
      #high;
      #medium;
      #low;
    };
    status : {
      #red;
      #yellow;
      #blue;
      #green;
    };
    proofFile : ?Storage.ExternalBlob;
    proofSubmittedBy : ?Text;
    proofSubmittedByEmail : ?Text;
    submissionTimestamp : ?Int;
    approvalStatus : {
      #pending;
      #approved;
      #rejected;
      #pendingReview;
    };
    rejectionReason : ?Text;
    completionTime : ?Int;
    performancePoints : Int;
  };

  type NewActor = {
    lastTaskId : Nat;
    tasks : Map.Map<Nat, NewTask>;
  };

  // Migration function called by the main actor via with-clause
  public func run(old : OldActor) : NewActor {
    let newTasks = old.tasks.map<Nat, OldTask, NewTask>(
      func(_id, oldTask) {
        {
          oldTask with
          proofSubmittedBy = null;
          proofSubmittedByEmail = null;
          submissionTimestamp = null;
        };
      }
    );
    {
      old with
      tasks = newTasks;
    };
  };
};
