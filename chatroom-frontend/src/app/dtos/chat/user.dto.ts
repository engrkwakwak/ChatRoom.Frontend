export interface UserDto {
    userId: number;
    username: string;
    displayName: string;
    email: string;
    address?: string;
    birthDate?: Date;
    isEmailVerified: boolean;
    displayPictureUrl?: string;
    dateCreated?: Date;
}
