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
export interface UserProfile {
    accountStatus: AccountStatus;
    name: string;
    role: UserRole;
    performancePoints: bigint;
    department: string;
}
export type Time = bigint;
export interface Task {
    status: TaskStatus;
    title: string;
    proofFile?: ExternalBlob;
    assignedTo: Principal;
    completionTime?: Time;
    rejectionReason?: string;
    description: string;
    performancePoints: bigint;
    deadline: Time;
    approvalStatus: ApprovalStatus;
    taskId: bigint;
    priority: TaskPriority;
    department: Department;
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
     * / Approve a task. Admin-only (admins represent managers in this system).
     */
    approveTask(taskId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    /**
     * / Create a task. Admin-only (admins represent managers in this system).
     */
    createTask(title: string, department: Department, assignedTo: Principal, description: string, deadline: Time, priority: TaskPriority): Promise<bigint>;
    deleteUser(user: Principal): Promise<void>;
    /**
     * / Admin dashboard: aggregate statistics.
     */
    getAdminDashboard(): Promise<{
        totalTasks: bigint;
        completedTasks: bigint;
        leaderboard: Array<[Principal, bigint]>;
        lateTasks: bigint;
    }>;
    getAllUsersStats(): Promise<Array<UserStats>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    /**
     * / Get tasks assigned to the caller. Requires at least a registered user.
     */
    getTasksForCaller(): Promise<Array<Task>>;
    /**
     * / Get tasks for a specific user.
     * / Admins can query any user; a regular user can only query their own tasks.
     */
    getTasksForUser(user: Principal): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Reject a task. Admin-only (admins represent managers in this system).
     */
    rejectTask(taskId: bigint, reason: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleUserAccountStatus(user: Principal, status: AccountStatus): Promise<void>;
    updateUserRole(user: Principal, newRole: UserRole): Promise<void>;
    /**
     * / Upload proof for a task. Only the assigned employee.
     */
    uploadProofFile(taskId: bigint, file: ExternalBlob): Promise<void>;
}
