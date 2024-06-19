import { AddMembersModalComponent } from "../../pages/chat/components/add-members-modal/add-members-modal.component";
import { ChatForCreationDto } from "./chat-for-creation.dto";

export interface AddMembersDialogContext extends Partial<AddMembersModalComponent> {
    chat: ChatForCreationDto;
}
