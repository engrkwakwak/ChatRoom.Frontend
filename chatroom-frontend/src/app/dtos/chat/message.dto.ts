export interface MessageDto {
    messageId: number;
    chatId: number;
    content: string;
    dateSent: Date;
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
}
