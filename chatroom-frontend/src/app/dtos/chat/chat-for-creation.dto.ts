export interface ChatForCreationDto {
    chatTypeId: number;
    statusId: number;
    chatMemberIds: number[];
    chatName?: string;
    displayPictureUrl?: string;
}
