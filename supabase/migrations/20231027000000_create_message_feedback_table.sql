CREATE TABLE public.message_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    is_positive boolean NOT NULL,
    feedback_text text NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.message_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to insert their own feedback"
ON public.message_feedback
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to view their own feedback"
ON public.message_feedback
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Optional: Indexes for querying
CREATE INDEX idx_message_feedback_message_id ON public.message_feedback(message_id);
CREATE INDEX idx_message_feedback_user_id ON public.message_feedback(user_id);
CREATE INDEX idx_message_feedback_conversation_id ON public.message_feedback(conversation_id);
