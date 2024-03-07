import Component from "@glimmer/component";
import formatDate from "discourse/helpers/format-date";

export default class ThreadPreview extends Component {
  get lastReplyDate() {
    return formatDate(this.args.preview.lastReplyCreatedAt, { leaveAgo: true });
  }

  <template>
    <span class="chat-message-thread-indicator__last-reply-timestamp">
      {{this.lastReplyDate}}
    </span>
    <div class="c-user-thread__excerpt">
      <div class="c-user-thread__excerpt-poster">
        {{@preview.lastReplyUser.username}}<span>:</span>
      </div>
      {{@preview.lastReplyExcerpt}}
    </div>
  </template>
}
