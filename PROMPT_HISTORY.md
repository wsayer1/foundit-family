# Prompt History

A chronological log of all user prompts submitted to the Bolt Agent for this project.

**Format:** `- **[YYYY-MM-DD]** | <prompt summary> | Prompt: "<prompt text>"`

---

- **[2026-03-02]** | Created prompt history tracking system and updated CLAUDE.md with instructions | Prompt: "From now on, I would like to keep track of all of the prompts that I write in The Bolt Agent. Please create a PROMPT_HISTORY.md file in the project root. add to the Claude.md file to add the user prompt to this history each time the prompt is completed. I would like this to be done in a token-efficient way..."
- **[2026-03-02]** | Removed token count field from prompt history tracking format | Prompt: "Given that the agent doesn't have direct access to Bolt's internal token metering, please remove this."
- **[2026-03-02 17:09]** | Added time field to prompt history tracking format | Prompt: "Please add the time field into the prompt history as well."

- **Updated prompt history format: summary now bold, prompt on second line, date on third line, with spacing between entries**
  Prompt: "Here is a screenshot of my prompt history file. Rather than having the date showing as green, I would like the prompt summary to show as green, and then the prompt should be on the next line, and then the date should be underneath it. Also add a space in between each of the prompts so I can read it a little bit better."
  _2026-03-02 17:13 UTC_

- [Updated prompt history format to use square brackets for green summary text]
  Prompt: "I've noticed that markdown is displayed as green text when it's inside a square bracket. Please put the prompt summary inside of a square bracket so it looks green. Keep it Bolt."
  _2026-03-02 17:15 UTC_

- [Fixed image classification, lightened landing page background, stabilized skeleton loaders]
  Prompt: "I am a software debugging and UI/UX improvement assistant. You have reported three technical issues that need to be resolved: Issue 1: Image Classification Malfunction, Issue 2: Dark Background Image, Issue 3: Skeleton Loader Size Issues"
  _2026-03-18 12:00 UTC_

- [Fixed landing page skeleton loaders persisting after load; featured items now fall back to past items]
  Prompt: "The Your Neighborhood, Your Community section of the landing page still has rotating skeleton loaders. Also, if there are no current items in the database, use past ones."
  _2026-03-18 12:15 UTC_

- [Fixed leaderboard page: created public_profiles DB view for data privacy, updated hook to query restricted view, fixed skeleton loader width, added error state display]
  Prompt: "1. yes they can be visible. 2. actually just use the entire username 3. yes please"
  _2026-03-18 19:30 UTC_

- [Confirmed profile creation and points system are working correctly - no changes needed]
  Prompt: "Perfect, you can start implementing this plan\!"
  _2026-03-18 19:00 UTC_

- [Added recent listings to Discover empty state, PreviewCard for guests, fixed skeleton loader expansion]
  Prompt: "Perhaps can we implement a similar approach to the Discover page? Even if there are no finds yet, can you show past items that have been listed? Perhaps the three most recent ones? Also, I still have the problem with the skeleton loader of the item card visually expanding when the Discover page is loading."
  _2026-03-18 19:10 UTC_

- [Implemented Tyler's desktop UX feedback: added filter sidebar on Discover page, map light/dark toggle, and expanded Leaderboard with community stats sidebar]
  Prompt: "Using the Granola connector please look at the meeting notes from my recent user feedback session with Tyler. Create a clear plan to implement his feedback."
  _2026-03-18 19:30 UTC_

- [Made user location marker pass through taps so nearby items are clickable]
  Prompt: "If an item is very close to my current location on the map page, and I try and click or tap on the item, often it won't work. I have a feeling that the location marker is blocking the tap. Please let the tap pass through the location indicator so that I can easily open these items while keeping the location indicator visually stacked on top of the other items."
  _2026-05-11 00:00 UTC_

- [Explicitly disabled pointer events on pulsating location rings so taps pass through]
  Prompt: "Still, the rings that are pulsating, growing out from the current location marker seem to obstruct my ability to click on the listed items."
  _2026-05-11 00:00 UTC_

- [Created Notion page "Foundit.Family WebApp Info" with complete site map, route table, user flows, and architecture overview]
  Prompt: "Review this project and create a clear site map that shows every major page, how the pages connect, and the purpose of each route. Include the key user flows so a teammate can quickly understand the structure of the app."
  _2026-05-19 12:00 UTC_

- [Fixed onboarding and first-time experience friction: landing page redirect, auth tab colors, email form visibility, welcome banner, guest limit, onboarding guide]
  Prompt: "Go ahead and fix the onboarding and first-time experience friction."
  _2026-05-20 00:00 UTC_

- [Wrote component docs: updated FeedbackModal/FilterBar/FilterSidebar/ItemCard docs, created 11 new docs, refreshed docs/README.md index]
  Prompt: "A refactor session just modified/created many components and you must write the docs. UPDATE existing docs (FeedbackModal, FilterBar, FilterSidebar, ItemCard) and CREATE docs for LogoBadge, DescriptionEditor, DiscoverMapView, AuthBackgroundGrid, UserLocationMarker, LocationPermissionScreen, Settin [truncated]"
  _2026-06-10 22:47 UTC_

- [Audited codebase and delivered prioritized maintainability refactor plan]
  Prompt: "I want to refactor this project to make it cleaner and easier to maintain. Before changing any code, audit the codebase and give me a plan. Look for the things that most hurt maintainability: files that are too long or doing too many unrelated things; the same logic duplicated in more than one place; compo [truncated]"
  _2026-06-10 14:30 UTC_

- [Executed high-impact refactor: fixed 3 latent bugs, fixed image descriptions (gemini-2.5-flash), removed dead code, deduped logic, split useItems.ts, broke up ItemDetailPage into hooks/components, extracted database calls into hooks, updated docs]
  Prompt: "1. yes 2. high impact first 3. im not sure, i've noticed that image descriptions are no longer working, so let's keep it and fix it if we need to so that it works."
  _2026-06-10 14:30 UTC_

- [Fixed all database security linter findings: definer views, function grants, storage listing policies, rate_limits RLS]
  Prompt: "Fix the following security issues: Security Definer Views (public_items_view, public_profiles_view, public_profiles), Public Bucket Listing (avatars, items), 17 SECURITY DEFINER functions executable by anon/authenticated, rate_limits RLS enabled no policy" [truncated]
  _2026-06-10 23:05 UTC_
