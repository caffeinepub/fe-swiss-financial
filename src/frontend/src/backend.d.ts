import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface KYCEntry {
    result: string;
    date: Time;
    notes: string;
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
export interface ClientProfile {
    id: bigint;
    dob?: string;
    status: ClientStatus;
    onboardingDate?: Time;
    clientType: ClientType;
    name: string;
    createdBy: Principal;
    createdDate: Time;
    kycHistory: Array<KYCEntry>;
    nationality: string;
    email: string;
    activityLog: Array<string>;
    kycReviewDue?: Time;
    relationshipManager: Principal;
    address: string;
    riskJustification: string;
    phone: string;
    riskLevel: RiskLevel;
    onboardingSteps: Array<OnboardingStep>;
}
export interface OnboardingStage {
    cards: Array<OnboardingCard>;
    stageName: string;
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
export interface UserProfile {
    name: string;
    role: string;
    email: string;
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createClient(profile: ClientProfile): Promise<bigint>;
    deleteClient(id: bigint): Promise<void>;
    getAllClients(): Promise<Array<ClientProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClient(id: bigint): Promise<ClientProfile>;
    getDashboardStats(): Promise<DashboardStats>;
    getOnboardingPipeline(): Promise<Array<OnboardingStage>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    moveClientToStage(clientId: bigint, stepNumber: bigint, status: string, assignedPerson: string, dueDate: Time | null): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateClient(id: bigint, updatedProfile: ClientProfile): Promise<void>;
}
