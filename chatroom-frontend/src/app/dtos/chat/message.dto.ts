import { UserDisplayDto } from "./user-display.dto"

export interface MessageDto {
    messageId : number
    chatId : number
    senderId : number
    messageTypeId : number
    content : string
    dateSent : Date
    statusId : number
    sender: {
        userId: number;
        displayName: string;
        displayPictureUrl: string;
    }
    messageType: {
        msgTypeId: number;
        msgTypeName: string;
    }
    status: {
        statusId: number;
        statusName: string;
    }
    lastSeenUsers: UserDisplayDto[]
}
