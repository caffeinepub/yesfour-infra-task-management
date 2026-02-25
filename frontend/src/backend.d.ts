import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface TaskResponse {
    status: TaskStatus;
    title: string;
    proofFile?: ExternalBlob;
    assignedTo: Principal;
    completionTime?: Time;
    submissionTimestamp?: Time;
    rejectionReason?: string;
    description: string;
    performancePoints: bigint;
    deadline: Time;
    approvalStatus: ApprovalStatus;
    taskId: bigint;
    proofSubmittedBy?: string;
    priority: TaskPriority;
    proofSubmittedByEmail?: string;
    department: Department;
}
export interface UserSummary {
    principal: Principal;
    name: string;
    email: string;
    department: string;
}
export interface UserProfile {
    accountStatus: AccountStatus;
    name: string;
    role: UserRole;
    performancePoints: bigint;
    email: string;
    department: string;
}
export interface UserStats {
    totalTasks: bigint;
    tasksCompleted: bigint;
    performancePoints: bigint;
    profile: UserProfile;
}
export enum AccountStatus {
    active = "active",
    inactive = "inactive"
}
export enum ApprovalStatus {
    pendingReview = "pendingReview",
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum Department {
    construction = "construction",
    marketing = "marketing",
    accounts = "accounts",
    travelDesk = "travelDesk",
    apartments = "apartments"
}
export enum TaskPriority {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum TaskStatus {
    red = "red",
    blue = "blue",
    green = "green",
    yellow = "yellow"
}
export enum UserRole {
    manager = "manager",
    admin = "admin",
    employee = "employee"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Approve a task. Accessible by admins and managers only.
     */
    approveTask(taskId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    /**
     * / Create a task. Accessible by admins and managers only.
     * / Accepts an email address as the assignee identifier.
     */
    createTask(title: string, department: Department, assigneeEmail: string, description: string, deadline: Time, priority: TaskPriority): Promise<bigint>;
    deleteUser(user: Principal): Promise<void>;
    /**
     * / Returns all active users (name, email, department, principal).
     * / Accessible by admins and managers only.
     */
    getActiveUsers(): Promise<Array<UserSummary>>;
    /**
     * / Admin dashboard: aggregate statistics.
     */
    getAdminDashboard(): Promise<{
        totalTasks: bigint;
        completedTasks: bigint;
        leaderboard: Array<[Principal, bigint]>;
        lateTasks: bigint;
    }>;
    /**
     * / Get all tasks. Accessible by admins and managers only.
     * / Proof fields are included because only admins/managers can call this.
     */
    getAllTasks(): Promise<Array<TaskResponse>>;
    getAllUsersStats(): Promise<Array<UserStats>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    /**
     * / Get tasks assigned to the caller.
     * / Proof fields are visible because the caller is the assigned employee.
     */
    getTasksForCaller(): Promise<Array<TaskResponse>>;
    /**
     * / Get tasks for a specific user.
     * / Admins/managers can view any user's tasks with full proof data.
     * / An employee can only view their own tasks (with proof data).
     * / No other caller may access this endpoint.
     */
    getTasksForUser(user: Principal): Promise<Array<TaskResponse>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Reject a task. Accessible by admins and managers only.
     */
    rejectTask(taskId: bigint, reason: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleUserAccountStatus(user: Principal, status: AccountStatus): Promise<void>;
    updateUserRole(user: Principal, newRole: UserRole): Promise<void>;
    /**
     * / Upload proof for a task. Only the assigned employee can upload proof.
     */
    uploadProofFile(taskId: bigint, file: ExternalBlob, submittedByName: string, submittedByEmail: string): Promise<void>;
}
