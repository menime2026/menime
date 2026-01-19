"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { productReviewsQueryKey } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RatingStars from "@/components/ui/rating-stars";

const reviewFormSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(120),
  comment: z.string().max(1000),
});

export type ProductReviewUser = {
  id: string;
  name: string;
  image: string | null;
};

export type ProductReviewItem = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
  user: ProductReviewUser;
};

export type ProductReviewDistribution = {
  rating: number;
  count: number;
  percentage: number;
};

export type ProductReviewBundleClient = {
  averageRating: number | null;
  reviewCount: number;
  reviews: ProductReviewItem[];
  userReview: ProductReviewItem | null;
  distribution: ProductReviewDistribution[];
};

const normalizeReview = (review: ProductReviewItem): ProductReviewItem => {
  return {
    ...review,
    title: review.title ?? null,
    comment: review.comment ?? null,
    createdAt: typeof review.createdAt === "string" ? review.createdAt : new Date(review.createdAt).toISOString(),
    user: {
      id: review.user.id,
      name: review.user.name,
      image: review.user.image ?? null,
    },
  } satisfies ProductReviewItem;
};

const normalizeBundle = (data: ProductReviewBundleClient): ProductReviewBundleClient => {
  return {
    averageRating: typeof data.averageRating === "number" ? data.averageRating : null,
    reviewCount: data.reviewCount ?? 0,
    reviews: Array.isArray(data.reviews) ? data.reviews.map((review) => normalizeReview(review)) : [],
    userReview: data.userReview ? normalizeReview(data.userReview) : null,
    distribution: Array.isArray(data.distribution)
      ? data.distribution.map((entry) => ({
          rating: entry.rating,
          count: entry.count,
          percentage: entry.percentage,
        }))
      : [],
  } satisfies ProductReviewBundleClient;
};

type ProductReviewsProps = {
  productId: string;
  productName: string;
  signInHref?: string;
  initialData: ProductReviewBundleClient;
};

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

const formatReviewDate = (isoDate: string) => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
};

const ProductReviews = ({ productId, productName, signInHref = "/sign-in", initialData }: ProductReviewsProps) => {
  const queryClient = useQueryClient();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"idle" | "success" | "error">("idle");

  const reviewsQuery = useQuery<ProductReviewBundleClient>({
    queryKey: productReviewsQueryKey(productId),
    queryFn: async () => {
      const response = await fetch(`/api/storefront/reviews?productId=${productId}`);
      if (!response.ok) {
        throw new Error("Unable to fetch reviews at this time.");
      }

      const payload = (await response.json()) as ProductReviewBundleClient;
      return normalizeBundle(payload);
    },
    initialData: normalizeBundle(initialData),
  });

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: reviewsQuery.data?.userReview?.rating ?? 5,
      title: reviewsQuery.data?.userReview?.title ?? "",
      comment: reviewsQuery.data?.userReview?.comment ?? "",
    },
  });

  const ratingValue = useWatch({ control: form.control, name: "rating" });
  const activeRating = typeof ratingValue === "number" ? ratingValue : reviewsQuery.data?.userReview?.rating ?? 5;

  const mutation = useMutation<ProductReviewBundleClient, Error, ReviewFormValues>({
    mutationFn: async (values) => {
      const trimmedTitle = values.title.trim();
      const trimmedComment = values.comment.trim();

      const response = await fetch("/api/storefront/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: values.rating,
          title: trimmedTitle.length ? trimmedTitle : undefined,
          comment: trimmedComment.length ? trimmedComment : undefined,
        }),
      });

      if (response.status === 401) {
        throw new Error("Please sign in to share your review.");
      }

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: unknown } | null;
        const message = data && typeof data.error === "string" ? data.error : "Unable to save your review.";
        throw new Error(message);
      }

      const payload = (await response.json()) as ProductReviewBundleClient;
      return normalizeBundle(payload);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(productReviewsQueryKey(productId), data);
      form.reset({
        rating: data.userReview?.rating ?? 5,
        title: data.userReview?.title ?? "",
        comment: data.userReview?.comment ?? "",
      });
      setStatusTone("success");
      setStatusMessage("Thanks for sharing your thoughts!");
    },
    onError: (error) => {
      setStatusTone("error");
      setStatusMessage(error.message || "We couldn\'t save your review. Try again soon.");
    },
    onMutate: () => {
      setStatusTone("idle");
      setStatusMessage(null);
    },
  });

  const reviewData = reviewsQuery.data;
  const hasReviews = (reviewData?.reviewCount ?? 0) > 0;
  const displayedReviews = reviewData?.reviews ?? [];

  const distribution = useMemo(() => {
    if (!reviewData) {
      return [] as ProductReviewDistribution[];
    }

    return reviewData.distribution.length
      ? reviewData.distribution
      : Array.from({ length: 5 }).map((_, index) => ({
          rating: 5 - index,
          count: 0,
          percentage: 0,
        }));
  }, [reviewData]);

  const handleRatingSelect = (value: number) => {
    form.setValue("rating", value, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="bg-white">
      <div className="grid gap-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <aside className="space-y-10">
          <div>
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-6xl font-light text-slate-900">
                {reviewData?.averageRating ? reviewData.averageRating.toFixed(1) : "—"}
              </span>
              <div className="flex flex-col">
                {reviewData?.averageRating ? (
                  <RatingStars rating={reviewData.averageRating} size="lg" />
                ) : (
                  <RatingStars rating={5} size="lg" className="opacity-20" />
                )}
                <span className="text-xs uppercase tracking-widest text-slate-500 mt-1">
                  {reviewData?.reviewCount ? `${reviewData.reviewCount} Reviews` : "No Reviews"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {distribution.map((entry) => (
                <div key={entry.rating} className="flex items-center gap-4 text-sm">
                  <span className="w-3 text-slate-900 font-medium">{entry.rating}</span>
                  <div className="relative h-1.5 flex-1 overflow-hidden bg-slate-100">
                    <div
                      className="absolute inset-y-0 left-0 bg-slate-900"
                      style={{ width: `${entry.percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-slate-400">{entry.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-6 text-sm text-slate-600 leading-relaxed">
            <p>
              <span className="font-bold text-slate-900 block mb-2 uppercase tracking-widest text-xs">We Value Your Voice</span>
              Share how {productName} fits into your wardrobe. Highlight the fabric, fit, or styling tips to help fellow shoppers make the right choice.
            </p>
          </div>
        </aside>

        <div className="space-y-12">
          <section className="bg-white">
            <div className="flex flex-col gap-6 mb-8">
              <h3 className="text-xl font-light text-slate-900">
                {reviewData?.userReview ? "Update Your Review" : "Write A Review"}
              </h3>
              <p className="text-sm text-slate-500">
                Your insights help the community style confidently.
              </p>
            </div>

            <form
              className="space-y-6"
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            >
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-900">Rating</label>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const starValue = index + 1;
                    const isActive = activeRating >= starValue;
                    return (
                      <button
                        key={starValue}
                        type="button"
                        className={cn(
                          "flex h-10 w-10 items-center justify-center transition text-2xl",
                          isActive ? "text-slate-900" : "text-slate-200 hover:text-slate-400"
                        )}
                        onClick={() => handleRatingSelect(starValue)}
                        aria-label={`Rate ${starValue} star${starValue === 1 ? "" : "s"}`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-900" htmlFor="review-title">
                  Headline
                </label>
                <Input
                  id="review-title"
                  placeholder="Summary of your experience"
                  className="border-0 border-b border-slate-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-slate-900 placeholder:text-slate-300"
                  {...form.register("title")}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-900" htmlFor="review-comment">
                  Review
                </label>
                <Textarea
                  id="review-comment"
                  placeholder="Tell us about the fabric, fit, styling ideas..."
                  rows={4}
                  className="border-0 border-b border-slate-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-slate-900 placeholder:text-slate-300 resize-none"
                  {...form.register("comment")}
                />
              </div>

              {statusMessage ? (
                <p
                  className={cn(
                    "text-sm",
                    statusTone === "success"
                      ? "text-emerald-600"
                      : statusTone === "error"
                        ? "text-rose-600"
                        : "text-slate-500",
                  )}
                >
                  {statusMessage}
                </p>
              ) : null}

              {mutation.isError && mutation.error.message.includes("sign in") ? (
                <p className="text-sm text-slate-500">
                  Please <Link href={signInHref} className="font-medium text-slate-900 underline-offset-4 hover:underline">sign in</Link> to leave a review.
                </p>
              ) : null}

              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-none border-slate-200 uppercase tracking-widest text-xs font-bold h-12 px-8 hover:bg-slate-50 hover:text-slate-900"
                  onClick={() => form.reset()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="rounded-none bg-slate-900 text-white uppercase tracking-widest text-xs font-bold h-12 px-8 hover:bg-slate-800"
                >
                  {mutation.isPending ? "Saving..." : "Submit Review"}
                </Button>
              </div>
            </form>
          </section>

          <section className="space-y-8 pt-12 border-t border-slate-100">
            <h3 className="text-xl font-light text-slate-900">Latest Reviews</h3>

            {hasReviews ? (
              <div className="space-y-8">
                {displayedReviews.map((review) => (
                  <article
                    key={review.id}
                    className="pb-8 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-100">
                          {review.user.image ? (
                            <Image
                              src={review.user.image}
                              alt={review.user.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase text-slate-500">
                              {review.user.name.substring(0, 2)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{review.user.name}</p>
                          <p className="text-xs text-slate-400 uppercase tracking-wider">{formatReviewDate(review.createdAt)}</p>
                        </div>
                      </div>
                      <RatingStars rating={review.rating} size="sm" />
                    </div>

                    <div className="pl-13 md:pl-13">
                      {review.title ? (
                        <h4 className="text-base font-medium text-slate-900 mb-2">{review.title}</h4>
                      ) : null}
                      {review.comment ? (
                        <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-slate-500 italic">
                No reviews yet. Be the first to share your thoughts.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
