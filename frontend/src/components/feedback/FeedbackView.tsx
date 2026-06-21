"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { feedbackApi } from "@/lib/api";

function FeedbackForm() {
  const { addToast, diagnoses } = useAppStore();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const latestDiagnosis = diagnoses[0];
  const diagnosisId     = searchParams.get("id") || latestDiagnosis?.id || null;
  const cropName        = searchParams.get("crop") || latestDiagnosis?.crop || "";
  const diseaseName     = searchParams.get("disease") || latestDiagnosis?.disease || "";
  const cropEmoji       = latestDiagnosis?.cropEmoji || "🌿";

  const [rating,    setRating]    = useState(0);
  const [hover,     setHover]     = useState(0);
  const [accurate,  setAccurate]  = useState<boolean | null>(null);
  const [helpful,   setHelpful]   = useState<"yes" | "somewhat" | "no" | null>(null);
  const [comment,   setComment]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent! 🎉"];

  const submit = async () => {
    if (!rating) {
      addToast("Please select a star rating first", "error");
      return;
    }

    // If no diagnosisId — still allow anonymous feedback
    const effectiveId = diagnosisId || `anonymous-${Date.now()}`;

    setLoading(true);
    try {
      await feedbackApi.submit({
        diagnosis_id: effectiveId,
        rating,
        comment: [
          comment,
          helpful ? `Treatment helpfulness: ${helpful}` : "",
        ].filter(Boolean).join(" | ") || undefined,
        was_accurate: accurate ?? undefined,
      });

      setSubmitted(true);
      addToast("Thank you for your feedback! 🙏", "success");
      setTimeout(() => router.push("/dashboard"), 1500);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit feedback.";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-heading font-bold text-2xl text-gray-900 mb-2">
            Thank You!
          </h2>
          <p className="text-gray-500 text-sm">
            Your feedback helps improve CropGuard AI for all farmers.
          </p>
          <p className="text-gray-400 text-xs mt-2">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-gray-900">
          Rate Your Diagnosis
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Help us improve by sharing your experience
        </p>
      </div>

      <Card className="p-7 max-w-xl">

        {/* Diagnosis reference */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-7">
          <span className="text-3xl">{cropEmoji}</span>
          <div>
            <div className="font-medium text-sm text-gray-800">
              {cropName && diseaseName
                ? `${cropName} — ${diseaseName}`
                : latestDiagnosis
                ? `${latestDiagnosis.crop} — ${latestDiagnosis.disease}`
                : "Your recent diagnosis"}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {latestDiagnosis?.date || "Recent"}
            </div>
          </div>
        </div>

        {/* No diagnosis warning */}
        {!diagnosisId && (
          <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            ⚠️ No specific diagnosis found. Your feedback will still be recorded.
          </div>
        )}

        {/* Star Rating */}
        <div className="mb-7">
          <div className="text-sm font-medium text-gray-700 mb-3">
            Overall Rating <span className="text-red-500">*</span>
          </div>
          <div className="flex gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <motion.button
                key={n}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                className={`text-4xl transition-colors duration-100 ${
                  (hover || rating) >= n ? "text-amber-400" : "text-gray-200"
                }`}
              >
                ★
              </motion.button>
            ))}
          </div>
          {(rating || hover) > 0 && (
            <div className="text-sm font-medium text-green-600">
              {ratingLabels[hover || rating]}
            </div>
          )}
        </div>

        {/* Was it accurate? */}
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-700 mb-3">
            Was the diagnosis accurate?
          </div>
          <div className="flex flex-wrap gap-2">
            {([["Yes, very accurate", true], ["Not accurate", false]] as [string, boolean][]).map(
              ([label, val]) => (
                <button
                  key={String(label)}
                  onClick={() => setAccurate(accurate === val ? null : val)}
                  className={`px-4 py-2 rounded-full text-sm border-2 transition-all ${
                    accurate === val
                      ? "border-green-500 bg-green-50 text-green-700 font-medium"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Were treatments helpful? */}
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-700 mb-3">
            Were the treatment recommendations helpful?
          </div>
          <div className="flex flex-wrap gap-2">
            {([
              ["Yes, helpful", "yes"],
              ["Somewhat helpful", "somewhat"],
              ["Not helpful", "no"],
            ] as [string, "yes" | "somewhat" | "no"][]).map(([label, value]) => (
              <button
                key={label}
                onClick={() => setHelpful(helpful === value ? null : value)}
                className={`px-4 py-2 rounded-full text-sm border-2 transition-all ${
                  helpful === value
                    ? "border-green-500 bg-green-50 text-green-700 font-medium"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-7">
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Additional Comments (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Share your experience or suggestions for improvement..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 placeholder:text-gray-400 resize-none transition-colors"
          />
        </div>

        <Button
          size="lg"
          loading={loading}
          disabled={submitted || rating === 0}
          className="w-full"
          onClick={submit}
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </Button>

        {rating === 0 && (
          <p className="text-center text-xs text-amber-500 mt-2">
            Please select a star rating to continue
          </p>
        )}

        <p className="text-center text-xs text-gray-400 mt-3">
          Your feedback helps train our AI to be more accurate for all farmers
        </p>
      </Card>
    </div>
  );
}

export function FeedbackView() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-green-100 border-t-green-600 rounded-full animate-spin" />
      </div>
    }>
      <FeedbackForm />
    </Suspense>
  );
}
