import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Int "mo:core/Int";

module {
  type OldUserProfile = {
    name : Text;
    department : Text;
    role : { #admin; #manager; #employee };
    performancePoints : Int;
  };

  type NewUserProfile = {
    name : Text;
    department : Text;
    role : { #admin; #manager; #employee };
    performancePoints : Int;
    accountStatus : { #active; #inactive };
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        {
          oldProfile with
          accountStatus = #active; // Default to active
        };
      }
    );
    {
      userProfiles = newUserProfiles;
    };
  };
};
