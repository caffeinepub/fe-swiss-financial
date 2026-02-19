import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type AdminRole = { #operator; #staff };
  type OldAdminEntry = {
    principal : Principal;
    name : Text;
    role : AdminRole;
    addedOn : Time.Time;
  };

  type OldActor = {
    admins : Map.Map<Principal, OldAdminEntry>;
    // Types that are explicitly dropped from the previous version must appear in this record.
    // Otherwise, the migration will not work!
    canisterDeployer : ?Principal;
  };

  type NewAdminEntry = {
    principal : Principal;
    name : Text;
    role : AdminRole;
    addedOn : Time.Time;
  };

  type NewActor = {
    admins : Map.Map<Principal, NewAdminEntry>;
  };

  public func run(old : OldActor) : NewActor {
    { admins = old.admins };
  };
};
