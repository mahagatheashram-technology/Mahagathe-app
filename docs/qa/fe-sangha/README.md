# fe-sangha QA screenshots (1×, 390pt wide)

`*-mock-vs-build.png`: left = v3 mock screenshot, right = Expo web build.
The mock's 52px status-bar padding is cropped from the left image; the web build has no device
status bar (safe-area inset = 0), so the two line up from the top of the content.

Other files are build-only states of screens the mocks do not draw: events calendar, vibhaga hub,
pathway page, volunteer sheet (form + confirmation), About sheet, Donate (custom amount, success,
failed, pending).
Failed/pending were captured with a temporary local patch to the mock `useCreateDonation`
(₹13 → failed, ₹14 → pending); that patch is not committed.
