import { DB } from "https://deno.land/x/sqlite@v3.9.0/mod.ts";

export type Review = {
    id: number,
    user_email: string,
    alias: string,
    review: string,
    rating: number,
}

export async function readReviews(db: DB) {
    const result = db.query("SELECT * FROM reviews LIMIT 10");

    const reviews: Review[] = result.map(([id, user_email, alias, review, rating]) => ({
        id,
        user_email,
        alias,
        review,
        rating,
    } as Review))

    console.log(reviews);
}