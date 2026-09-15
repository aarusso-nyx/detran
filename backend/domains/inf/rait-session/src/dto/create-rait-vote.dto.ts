// Generated from BP-INF-RAIT-SESSION-001 v1.1.0 sha256:24f07dd684f9142de9db5e84913c3e2899499e68aebd1d6ac33dc0a03c5eca01
export interface CreateRaitVoteDto {
  agenda_item_id: string;
  member_id: string;
  vote: string;
  casting_vote?: boolean;
  cast_at?: string;
}
