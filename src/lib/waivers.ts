export type WaiverRecord = {
  id: string;
  user_id: string;
  student_id: string | null;
  waiver_type: string;
  accepted_at: string;
  signature_name: string;
  signature_data: string | null;
  version: string;
};
