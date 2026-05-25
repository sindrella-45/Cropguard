"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { feedbackApi } from "@/lib/api";

export function FeedbackView() {
  const { addToast, diagnoses } = useAppStore();

  const router = useRouter();
  const searchParams = useSearchParams();

  const latestDiagnosis = diagnoses[0];

  const diagnosisId =
    searchParams.get("id") ||
    latestDiagnosis?.id ||
    null;

  const [rating, setRating] = useState(4);
  const [hover, setHover] = useState(0);

  const [accurate, setAccurate] = useState<boolean | null>(null);

  const [helpful, setHelpful] = useState<
    "yes" | "somewhat" | "no" | null
  >(null);

  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (!rating) {
      addToast("Please select a rating", "error");
      return;
    }

    if (!diagnosisId) {
      addToast("No diagnosis found to review.", "error");
      return;
    }

    setLoading(true);

    try {
      await feedbackApi.submit({
        diagnosis_id: diagnosisId,
        rating,
        comment:
          comment ||
          (helpful
            ? `Treatment helpfulness: ${helpful}`
            : undefined),
        was_accurate: accurate ?? undefined,
      });

      setSubmitted(true);

      addToast(
        "Thank you for your feedback! 🙏",
        "success"
      );

      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);

    } catch (err: any) {
      addToast(
        err.message || "Failed to submit feedback.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

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

        {/* Diagnosis Reference */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-7">
          <span className="text-3xl">
            {latestDiagnosis?.cropEmoji || "🌿"}
          </span>

          <div>
            <div className="font-medium text-sm text-gray-800">
              {latestDiagnosis
                ? `${latestDiagnosis.crop} — ${latestDiagnosis.disease}`
                : "Your recent diagnosis"}
            </div>

            <div className="text-xs text-gray-400 mt-0.5">
              {latestDiagnosis?.date || "Recent"}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-7">
          <div className="text-sm font-medium text-gray-700 mb-3">
            Overall Rating
          </div>

          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <motion.button
                key={n}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                className={`text-4xl transition-colors duration-100 ${
                  (hover || rating) >= n
                    ? "text-amber-400"
                    : "text-gray-200"
                }`}
              >
                ★
              </motion.button>
            ))}
          </div>

          <div className="text-xs text-gray-400 mt-2">
            {rating === 5
              ? "Excellent! 🎉"
              : rating === 4
              ? "Great!"
              : rating === 3
              ? "Good"
              : rating === 2
              ? "Could be better"
              : "Needs improvement"}
          </div>
        </div>

        {/* Accurate */}
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-700 mb-3">
            Was the diagnosis accurate?
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["Yes, very accurate", true],
              ["Not accurate", false],
            ].map(([label, val]) => (
              <button
                key={String(label)}
                onClick={() => setAccurate(val as boolean)}
                className={`px-4 py-2 rounded-full text-sm border-2 transition-all ${
                  accurate === val
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {label as string}
              </button>
            ))}
          </div>
        </div>

        {/* Helpful */}
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-700 mb-3">
            Were the treatment recommendations helpful?
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["Yes, helpful", "yes"],
              ["Somewhat helpful", "somewhat"],
              ["Not helpful", "no"],
            ].map(([label, value]) => (
              <button
                key={label}
                onClick={() =>
                  setHelpful(
                    value as "yes" | "somewhat" | "no"
                  )
                }
                className={`px-4 py-2 rounded-full text-sm border-2 transition-all ${
                  helpful === value
                    ? "border-green-500 bg-green-50 text-green-700"
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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 placeholder:text-gray-400 resize-none"
          />
        </div>

        <Button
          size="lg"
          loading={loading}
          disabled={submitted}
          className="w-full"
          onClick={submit}
        >
          {submitted
            ? "Feedback Submitted"
            : "Submit Feedback"}
        </Button>

        <p className="text-center text-xs text-gray-400 mt-3">
          Your feedback helps train our AI to be more accurate
        </p>
      </Card>
    </div>
  );
}