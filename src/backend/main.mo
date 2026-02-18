import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type ClientType = {
    #individual;
    #entity;
  };

  public type ClientStatus = {
    #prospect;
    #onboarding;
    #active;
    #offboarded;
  };

  public type RiskLevel = {
    #low;
    #medium;
    #high;
  };

  public type KYCEntry = {
    date : Time.Time;
    result : Text;
    notes : Text;
  };

  public type OnboardingStep = {
    stepNumber : Nat;
    description : Text;
    completed : Bool;
    completionDate : ?Time.Time;
    status : Text;
    assignedPerson : Text;
    dueDate : ?Time.Time;
  };

  public type ClientProfile = {
    id : Nat;
    name : Text;
    dob : ?Text;
    nationality : Text;
    address : Text;
    phone : Text;
    email : Text;
    clientType : ClientType;
    status : ClientStatus;
    riskLevel : RiskLevel;
    relationshipManager : Principal;
    onboardingDate : ?Time.Time;
    kycReviewDue : ?Time.Time;
    riskJustification : Text;
    kycHistory : [KYCEntry];
    onboardingSteps : [OnboardingStep];
    activityLog : [Text];
    createdBy : Principal;
    createdDate : Time.Time;
  };

  public type OnboardingCard = {
    clientId : Nat;
    clientName : Text;
    stepNumber : Nat;
    stepStatus : Text;
    assignedPerson : Text;
    dueDate : ?Time.Time;
  };

  public type OnboardingStage = {
    stageName : Text;
    cards : [OnboardingCard];
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  public type DashboardStats = {
    totalClients : Nat;
    prospectCount : Nat;
    onboardingCount : Nat;
    activeCount : Nat;
    offboardedCount : Nat;
    lowRiskCount : Nat;
    mediumRiskCount : Nat;
    highRiskCount : Nat;
  };

  // Storage
  let clients = Map.empty<Nat, ClientProfile>();
  var nextClientId = 1;
  let userProfiles = Map.empty<Principal, UserProfile>();
  var adminCreated = false;

  // Helper Functions
  func getClientOrTrap(id : Nat) : ClientProfile {
    switch (clients.get(id)) {
      case (null) { Runtime.trap("Client not found") };
      case (?client) { client };
    };
  };

  func checkAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func checkUser(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    checkUser(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not adminCreated) {
      adminCreated := true;
      userProfiles.add(caller, profile);
      return;
    };

    checkUser(caller);
    userProfiles.add(caller, profile);
  };

  // Client CRUD Operations
  public shared ({ caller }) func createClient(profile : ClientProfile) : async Nat {
    checkAdmin(caller);

    let clientId = nextClientId;
    nextClientId += 1;
    let newProfile = { profile with id = clientId };
    clients.add(clientId, newProfile);
    clientId;
  };

  public shared ({ caller }) func updateClient(id : Nat, updatedProfile : ClientProfile) : async () {
    checkAdmin(caller);
    ignore getClientOrTrap(id); // Ensure client exists
    clients.add(id, { updatedProfile with id });
  };

  public shared ({ caller }) func deleteClient(id : Nat) : async () {
    checkAdmin(caller);
    ignore getClientOrTrap(id); // Ensure client exists
    clients.remove(id);
  };

  public query ({ caller }) func getClient(id : Nat) : async ClientProfile {
    checkUser(caller);
    getClientOrTrap(id);
  };

  public query ({ caller }) func getAllClients() : async [ClientProfile] {
    checkUser(caller);
    clients.values().toArray();
  };

  // Onboarding Pipeline Functionality
  public query ({ caller }) func getOnboardingPipeline() : async [OnboardingStage] {
    checkUser(caller);

    let stages = ["Stage 1", "Stage 2", "Stage 3", "Stage 4", "Stage 5", "Stage 6"];
    let stageLists = List.fromArray<List.List<OnboardingCard>>(Array.tabulate<List.List<OnboardingCard>>(6, func(i) { List.empty<OnboardingCard>() }));

    for ((_, client) in clients.entries()) {
      for (step in client.onboardingSteps.values()) {
        let card : OnboardingCard = {
          clientId = client.id;
          clientName = client.name;
          stepNumber = step.stepNumber;
          stepStatus = step.status;
          assignedPerson = step.assignedPerson;
          dueDate = step.dueDate;
        };

        let stageIndex = if (step.stepNumber >= 1 and step.stepNumber <= 6) {
          step.stepNumber - 1;
        } else { 0 };

        if (stageIndex < stageLists.size()) {
          let listsArray = stageLists.values().toArray();
          if (stageIndex < listsArray.size()) {
            listsArray[stageIndex].add(card);
          };
        };
      };
    };

    let onboardingStages = List.empty<OnboardingStage>();
    for ((i, stageName) in stages.enumerate()) {
      if (i < stageLists.size()) {
        let listsArray = stageLists.values().toArray();
        if (i < listsArray.size()) {
          onboardingStages.add({
            stageName;
            cards = listsArray[i].toArray();
          });
        };
      };
    };

    onboardingStages.toArray();
  };

  public shared ({ caller }) func moveClientToStage(
    clientId : Nat,
    stepNumber : Nat,
    status : Text,
    assignedPerson : Text,
    dueDate : ?Time.Time,
  ) : async () {
    checkAdmin(caller);
    let client = getClientOrTrap(clientId);

    let updatedSteps = client.onboardingSteps.map(
      func(step) {
        if (step.stepNumber == stepNumber) {
          {
            step with
            status;
            assignedPerson;
            dueDate;
          };
        } else {
          step;
        };
      }
    );

    let updatedClient = { client with onboardingSteps = updatedSteps };
    clients.add(clientId, updatedClient);
  };

  // Dashboard Queries
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    checkUser(caller);

    var totalClients = 0;
    var prospectCount = 0;
    var onboardingCount = 0;
    var activeCount = 0;
    var offboardedCount = 0;
    var lowRiskCount = 0;
    var mediumRiskCount = 0;
    var highRiskCount = 0;

    for (client in clients.values()) {
      totalClients += 1;

      switch (client.status) {
        case (#prospect) { prospectCount += 1 };
        case (#onboarding) { onboardingCount += 1 };
        case (#active) { activeCount += 1 };
        case (#offboarded) { offboardedCount += 1 };
      };

      switch (client.riskLevel) {
        case (#low) { lowRiskCount += 1 };
        case (#medium) { mediumRiskCount += 1 };
        case (#high) { highRiskCount += 1 };
      };
    };

    {
      totalClients;
      prospectCount;
      onboardingCount;
      activeCount;
      offboardedCount;
      lowRiskCount;
      mediumRiskCount;
      highRiskCount;
    };
  };
};
