import { ChatMemberDto } from "./chat-member.dto";
import { ChatDto } from "./chat.dto";
import { MessageDto } from "./message.dto";

export interface ChatHubChatlistUpdateDto {
    chat : ChatDto
    latestMessage : MessageDto
    chatMembers : ChatMemberDto[]
}