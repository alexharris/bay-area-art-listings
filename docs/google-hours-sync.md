# How Google Hours Sync Works

## The Problem It Solves

Galleries and venues change their hours all the time. Rather than manually updating each location every time a venue adjusts its schedule, the site can pull current hours directly from Google and update automatically.

## Two Ways to Sync

### 1. Manual sync (one venue at a time)

In the Sanity Studio, open any location and go to the **Hours** tab. You'll see a **"Sync from Google"** button in the top-right corner of the hours section. Click it and the site will look up that venue's current hours on Google and update the fields automatically.

After syncing, a badge appears showing what changed — for example, "Updated: Mon, Fri" — or "Up to date" if nothing was different.

This only works if the location has a Google Place ID set (in the Info tab).

### 2. Automatic bulk sync (all venues at once)

There's a background job (cron job) that runs automatically on the **1st of every month at 9am**. It goes through every location with a Google Place ID and updates their hours in one go. This is what keeps the whole site fresh without anyone having to click through each venue manually.

It sends a summary email to the admin address afterward, listing how many venues were checked, which ones changed, and if anything went wrong.

The bulk sync can also be triggered manually if needed — useful if you've added several new locations and want to pull in their hours right away without waiting for the scheduled run.

## The Manual Override

Sometimes Google's hours for a venue are wrong, or you want to set custom hours that differ from what Google shows (e.g. special holiday hours, or a gallery with unusual scheduling).

On the **Hours** tab in Studio, there's a **"Manual Override"** checkbox. When this is turned on:

- The "Sync from Google" button will show **"Override active"** and won't change anything
- The automatic bulk sync will skip that venue entirely

Turn it off when you want Google to take over again.

## What Can Go Wrong

- If a venue doesn't have a Google Place ID, the sync button is grayed out and the bulk sync skips it
- If Google doesn't have hours for a venue, nothing changes
- If Google's API is down or there's a network error, the venue is skipped and noted in the summary email
