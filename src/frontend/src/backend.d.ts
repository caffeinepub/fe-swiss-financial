import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
    role: string;
    email: string;
}
export type Time = bigint;
export interface OnboardingCard {
    clientId: bigint;
    clientName: string;
    dueDate?: Time;
    stepNumber: bigint;
    assignedPerson: string;
    stepStatus: string;
}
export interface OnboardingStep {
    status: string;
    completionDate?: Time;
    completed: boolean;
    dueDate?: Time;
    description: string;
    stepNumber: bigint;
    assignedPerson: string;
}
export interface DashboardStats {
    prospectCount: bigint;
    lowRiskCount: bigint;
    offboardedCount: bigint;
    mediumRiskCount: bigint;
    highRiskCount: bigint;
    totalClients: bigint;
    activeCount: bigint;
    onboardingCount: bigint;
}
export interface OverviewFieldUpdate {
    tin?: string;
    placeOfBirth?: string;
    dateOfBirth?: string;
    passportExpiryDate?: string;
    nationality?: string;
    email?: string;
    address?: string;
    phone?: string;
    passportNumber?: string;
    primaryCountry?: string;
    lastName?: string;
    firstName?: string;
}
export interface AuthorizationResult {
    status: AuthorizationStatus;
    message: string;
}
export interface AdminEntry {
    principal: Principal;
    name: string;
    role: AdminRole;
    addedOn: Time;
}
export interface ActivityLogEntry {
    oldValue: string;
    user: string;
    newValue: string;
    timestamp: Time;
    fieldName: string;
}
export interface KYCEntry {
    result: string;
    date: Time;
    notes: string;
}
export interface ClientProfile {
    id: bigint;
    tin: string;
    placeOfBirth: string;
    status: ClientStatus;
    onboardingDate?: Time;
    accountId: string;
    clientType: ClientType;
    dateOfBirth: string;
    createdBy: Principal;
    createdDate: Time;
    passportExpiryDate: string;
    kycHistory: Array<KYCEntry>;
    nationality: string;
    email: string;
    activityLog: Array<string>;
    kycReviewDue?: Time;
    relationshipManager: Principal;
    address: string;
    riskJustification: string;
    phone: string;
    passportNumber: string;
    primaryCountry: string;
    lastName: string;
    riskLevel: RiskLevel;
    onboardingSteps: Array<OnboardingStep>;
    firstName: string;
}
export interface OnboardingStage {
    cards: Array<OnboardingCard>;
    stageName: string;
}
export enum AdminRole {
    operator = "operator",
    staff = "staff"
}
export enum AuthorizationStatus {
    authorized = "authorized",
    operatorMissing = "operatorMissing",
    unauthorized = "unauthorized"
}
export enum ClientStatus {
    active = "active",
    prospect = "prospect",
    onboarding = "onboarding",
    offboarded = "offboarded"
}
export enum ClientType {
    entity = "entity",
    individual = "individual"
}
export enum RiskLevel {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAdmin(principal: Principal, name: string, role: AdminRole): Promise<boolean>;
    appendActivityLogEntries(clientId: bigint, entries: Array<ActivityLogEntry>): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createClient(profile: ClientProfile): Promise<bigint>;
    deleteClient(id: bigint): Promise<void>;
    getAdminEntries(): Promise<Array<AdminEntry>>;
    getAdminEntry(principal: Principal): Promise<AdminEntry>;
    getAllClients(): Promise<Array<ClientProfile>>;
    getAllowlistSize(): Promise<bigint>;
    getCallerAdminEntry(): Promise<AdminEntry | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClient(id: bigint): Promise<ClientProfile>;
    getClientActivityLog(clientId: bigint): Promise<Array<string>>;
    getDashboardStats(): Promise<DashboardStats>;
    getOnboardingPipeline(): Promise<Array<OnboardingStage>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAuthorized(): Promise<AuthorizationResult>;
    isCallerAdmin(): Promise<boolean>;
    moveClientToStage(clientId: bigint, stepNumber: bigint, status: string, assignedPerson: string, dueDate: Time | null): Promise<void>;
    removeAdmin(principal: Principal): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateClient(id: bigint, updatedProfile: ClientProfile): Promise<void>;
    updateClientOverviewFields(id: bigint, updates: OverviewFieldUpdate): Promise<void>;
}
