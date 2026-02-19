import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let defaultAdminPrincipal = Principal.fromText("grzx7-efvee-eiav7-cphgh-j7zbs-jju44-7e5zt-embnv-eki5c-gmoof-uqe");

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
    firstName : Text;
    lastName : Text;
    accountId : Text;
    email : Text;
    phone : Text;
    address : Text;
    primaryCountry : Text;
    dateOfBirth : Text;
    nationality : Text;
    passportNumber : Text;
    passportExpiryDate : Text;
    placeOfBirth : Text;
    tin : Text;
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

  public type ActivityLogEntry = {
    timestamp : Time.Time;
    fieldName : Text;
    oldValue : Text;
    newValue : Text;
    user : Text;
  };

  public type OverviewFieldUpdate = {
    firstName : ?Text;
    lastName : ?Text;
    email : ?Text;
    phone : ?Text;
    address : ?Text;
    primaryCountry : ?Text;
    dateOfBirth : ?Text;
    nationality : ?Text;
    passportNumber : ?Text;
    passportExpiryDate : ?Text;
    placeOfBirth : ?Text;
    tin : ?Text;
  };

  public type AdminRole = { #operator; #staff };
  public type AdminEntry = {
    principal : Principal;
    name : Text;
    role : AdminRole;
    addedOn : Time.Time;
  };

  public type AuthorizationStatus = { #authorized; #unauthorized; #operatorMissing };
  public type AuthorizationResult = {
    status : AuthorizationStatus;
    message : Text;
  };

  public type OperatorStatus = {
    #operatorOnly;
    #staffOnly;
    #operatorAndStaff;
    #none;
  };

  // System Storage
  let clients = Map.empty<Nat, ClientProfile>();
  var nextClientId = 1;
  let userProfiles = Map.empty<Principal, UserProfile>();
  var adminCreated = false;
  let admins = Map.empty<Principal, AdminEntry>();
  var bootstrapCompleted = false;

  // Helper Functions
  func getClientOrTrap(id : Nat) : ClientProfile {
    switch (clients.get(id)) {
      case (null) { Runtime.trap("Client not found") };
      case (?client) { client };
    };
  };

  func requireAdmin(caller : Principal) {
    switch (admins.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: Caller is not in admin list");
      };
      case (?_) { /* authorized */ };
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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
    if (not adminCreated) {
      adminCreated := true;
      userProfiles.add(caller, profile);
      return;
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Client CRUD Operations
  public shared ({ caller }) func createClient(profile : ClientProfile) : async Nat {
    requireAdmin(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create clients");
    };
    let clientId = nextClientId;
    nextClientId += 1;
    let newProfile = { profile with id = clientId };
    clients.add(clientId, newProfile);
    clientId;
  };

  public shared ({ caller }) func updateClient(id : Nat, updatedProfile : ClientProfile) : async () {
    requireAdmin(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update clients");
    };
    ignore getClientOrTrap(id);
    clients.add(id, { updatedProfile with id });
  };

  public shared ({ caller }) func deleteClient(id : Nat) : async () {
    requireAdmin(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete clients");
    };
    ignore getClientOrTrap(id);
    clients.remove(id);
  };

  public query ({ caller }) func getClient(id : Nat) : async ClientProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clients");
    };
    getClientOrTrap(id);
  };

  public query ({ caller }) func getAllClients() : async [ClientProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clients");
    };
    clients.values().toArray();
  };

  // Overview Field Updates
  public shared ({ caller }) func updateClientOverviewFields(
    id : Nat,
    updates : OverviewFieldUpdate,
  ) : async () {
    requireAdmin(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update client fields");
    };
    let client = getClientOrTrap(id);

    let updatedClient = {
      client with
      firstName = switch (updates.firstName) { case (?v) { v }; case (null) { client.firstName } };
      lastName = switch (updates.lastName) { case (?v) { v }; case (null) { client.lastName } };
      email = switch (updates.email) { case (?v) { v }; case (null) { client.email } };
      phone = switch (updates.phone) { case (?v) { v }; case (null) { client.phone } };
      address = switch (updates.address) { case (?v) { v }; case (null) { client.address } };
      primaryCountry = switch (updates.primaryCountry) { case (?v) { v }; case (null) { client.primaryCountry } };
      dateOfBirth = switch (updates.dateOfBirth) { case (?v) { v }; case (null) { client.dateOfBirth } };
      nationality = switch (updates.nationality) { case (?v) { v }; case (null) { client.nationality } };
      passportNumber = switch (updates.passportNumber) { case (?v) { v }; case (null) { client.passportNumber } };
      passportExpiryDate = switch (updates.passportExpiryDate) { case (?v) { v }; case (null) { client.passportExpiryDate } };
      placeOfBirth = switch (updates.placeOfBirth) { case (?v) { v }; case (null) { client.placeOfBirth } };
      tin = switch (updates.tin) { case (?v) { v }; case (null) { client.tin } };
    };

    clients.add(id, updatedClient);
  };

  // Activity Log Management
  public shared ({ caller }) func appendActivityLogEntries(
    clientId : Nat,
    entries : [ActivityLogEntry],
  ) : async () {
    requireAdmin(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can append activity log entries");
    };
    let client = getClientOrTrap(clientId);

    let formattedEntries = entries.map(
      func(entry : ActivityLogEntry) : Text {
        let timestamp = entry.timestamp.toText();
        timestamp # " | " # entry.fieldName # " | Old: " # entry.oldValue # " | New: " # entry.newValue # " | User: " # entry.user;
      }
    );

    let updatedLog = client.activityLog.concat(formattedEntries);
    let updatedClient = { client with activityLog = updatedLog };
    clients.add(clientId, updatedClient);
  };

  public query ({ caller }) func getClientActivityLog(clientId : Nat) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view activity logs");
    };
    let client = getClientOrTrap(clientId);
    client.activityLog;
  };

  // Onboarding Pipeline Functionality
  public query ({ caller }) func getOnboardingPipeline() : async [OnboardingStage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view onboarding pipeline");
    };
    let stages = ["Stage 1", "Stage 2", "Stage 3", "Stage 4", "Stage 5", "Stage 6"];
    let stageLists = List.fromArray<List.List<OnboardingCard>>([List.empty<OnboardingCard>(), List.empty<OnboardingCard>(), List.empty<OnboardingCard>(), List.empty<OnboardingCard>(), List.empty<OnboardingCard>(), List.empty<OnboardingCard>()]);

    for ((_, client) in clients.entries()) {
      for (step in client.onboardingSteps.values()) {
        let card : OnboardingCard = {
          clientId = client.id;
          clientName = client.firstName # " " # client.lastName;
          stepNumber = step.stepNumber;
          stepStatus = step.status;
          assignedPerson = step.assignedPerson;
          dueDate = step.dueDate;
        };

        let stageIndex = if (step.stepNumber >= 1 and step.stepNumber <= 6) {
          if (step.stepNumber == 1) { 0 } else { step.stepNumber - 1 };
        } else { 0 };

        if (stageIndex < 6) {
          let listsArray = stageLists.values().toArray();
          if (stageIndex < listsArray.size()) {
            listsArray[stageIndex].add(card);
          };
        };
      };
    };

    let onboardingStages = List.empty<OnboardingStage>();
    for ((i, stageName) in stages.enumerate()) {
      if (i < 6) {
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
    requireAdmin(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can move clients to stages");
    };
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard stats");
    };
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

  // Admin Allowlist Functions

  // Add admin method - only operator can add staff
  public shared ({ caller }) func addAdmin(principal : Principal, name : Text, role : AdminRole) : async Bool {
    requireAdmin(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add admin entries");
    };

    // Check if caller is operator (only operators can add admins)
    switch (admins.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: Caller is not in admin list");
      };
      case (?callerEntry) {
        if (callerEntry.role != #operator) {
          Runtime.trap("Unauthorized: Only operators can add admin entries");
        };
      };
    };

    admins.add(principal, {
      principal;
      name;
      role;
      addedOn = Time.now();
    });
    true;
  };

  // Remove admin (except operator)
  public shared ({ caller }) func removeAdmin(principal : Principal) : async Bool {
    requireAdmin(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove admin entries");
    };

    // Check if caller is operator
    switch (admins.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: Caller is not in admin list");
      };
      case (?callerEntry) {
        if (callerEntry.role != #operator) {
          Runtime.trap("Unauthorized: Only operators can remove admin entries");
        };
      };
    };

    switch (admins.get(principal)) {
      case (null) { Runtime.trap("Admin not found") };
      case (?admin) {
        if (admin.role == #operator) {
          Runtime.trap("Cannot remove operator entry");
        };
        admins.remove(principal);
        true;
      };
    };
  };

  // Get all admin entries - requires admin permission, no auto-bootstrap
  public shared ({ caller }) func getAdminEntries() : async [AdminEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view admin entries");
    };

    // Check if the default admin exists, if not, add it
    switch (admins.get(defaultAdminPrincipal)) {
      case (null) {
        admins.add(
          defaultAdminPrincipal,
          {
            principal = defaultAdminPrincipal;
            name = "System Administrator";
            role = #operator;
            addedOn = Time.now();
          },
        );
      };
      case (?_) {};
    };
    admins.values().toArray();
  };

  // Get single admin entry
  public query ({ caller }) func getAdminEntry(principal : Principal) : async AdminEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view admin entries");
    };
    switch (admins.get(principal)) {
      case (null) { Runtime.trap("Admin entry not found") };
      case (?entry) { entry };
    };
  };

  // Get caller's own admin entry - NO authorization check (allows anyone to check their status)
  public shared ({ caller }) func getMyAdminEntry() : async ?AdminEntry {
    admins.get(caller);
  };

  // Bootstrap admin list - NO authorization check (allows first caller to bootstrap)
  public shared ({ caller }) func getAdminList() : async [AdminEntry] {
    // Allow bootstrap only once and only if list is empty
    if (not bootstrapCompleted and admins.isEmpty()) {
      let adminEntry = {
        principal = caller;
        name = "System Administrator";
        role = #operator;
        addedOn = Time.now();
      };

      admins.add(caller, adminEntry);
      bootstrapCompleted := true;
      [adminEntry];
    } else {
      // After bootstrap, require admin permission to view list
      if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
        Runtime.trap("Unauthorized: Only admins can view admin list");
      };
      admins.values().toArray();
    };
  };

  // Check if caller is authorized - NO authorization check (allows anyone to check their status)
  public query ({ caller }) func isAuthorized() : async AuthorizationResult {
    if (admins.isEmpty()) {
      return {
        status = #operatorMissing;
        message = "Operator entry does not exist. Please create one.";
      };
    };

    switch (admins.get(caller)) {
      case (null) {
        {
          status = #unauthorized;
          message = "Unknown Principal. You are not authorized.";
        };
      };
      case (?entry) {
        {
          status = #authorized;
          message = "Authorized as " # (if (entry.role == #operator) { "Operator" } else { "Staff" });
        };
      };
    };
  };

  // Get admin list size
  public query ({ caller }) func getAdminListSize() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view admin list size");
    };
    admins.size();
  };
};
