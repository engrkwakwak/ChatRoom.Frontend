import { UserDisplayDto } from "./user-display.dto";

export interface ChatMemberDto {
    chatId: number;
    user: UserDisplayDto,
    lastSeenMessageId: number;
    isAdmin: boolean;
    statusId: number;
    userId : number
}
