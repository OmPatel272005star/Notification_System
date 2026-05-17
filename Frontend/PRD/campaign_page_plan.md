# CampaignPage Rewrite Plan

## File to Edit
`src/pages/dashboard/CampaignPage.jsx` — full overwrite

## Data Shapes

```js
// Campaign object
{ id, name, description, type, status, scheduledStatus, createdAt }

// Types: Email | WhatsApp | SMS | In-App | Mobile Push | RCS | MMS | Web Push
// Status: Draft | Scheduled | Sending | Completed | Failed
// ScheduledStatus: Not Scheduled | Scheduled | Sent
```

## Dashboard List (Table)
Columns: Campaign Name + type icon | Description (truncated) | Type badge | Status badge | Scheduled Status | Actions (⋮)

Three-dot menu items: Edit, View, Delete
Delete → confirm dialog with "Remove Campaign" red button

## Wizard Steps (6 steps, progress bar)

| Step | Content |
|---|---|
| 1 | Campaign type picker — grid of 8 channel cards (Email, WhatsApp, SMS, etc.) |
| 2 | Name field + Description textarea + View Rights select + Edit Rights select |
| 3 | Template selector — search + list from `useTemplates()` context, checkbox select, "Confirm Selection" button |
| 4 | Settings — From Email dropdown (from INIT_CONNECTIONS), Sender Name input, Subject input |
| 5 | Audience — search bar + list from AUDIENCE_DATA, checkboxes, "Confirm Selection" |
| 6 | Summary card — all choices shown + "Save Campaign" button → status = Draft |

## Strategy

1. Keep all state in `CampaignPage` — no new context needed
2. Wizard is a single large modal (max-w-2xl), steps controlled by `step` useState
3. Template list: import `useTemplates` hook from `../../context/TemplateContext`
4. Audience: use inline mock data (same shape as AudiencePage INIT)
5. Connections: inline INIT_CONNECTIONS mock (same as ConnectionPage)
6. Progress bar: 6 filled divs, each turns purple when reached
7. Delete confirm: separate dialog component, same pattern as TemplatePage
8. Three-dot menu: fixed-position dropdown, same pattern as AudiencePage

## Key Components

```
CampaignPage
  ├── CampaignTable (list)
  ├── CampaignRowMenu (three-dot)
  ├── DeleteConfirm (dialog)
  └── CreateWizard (6-step modal)
       ├── Step1TypePicker
       ├── Step2Details
       ├── Step3TemplatePicker (uses useTemplates)
       ├── Step4Settings
       ├── Step5AudiencePicker
       └── Step6Summary
```

## Execution (in next conversation)

1. Write `CampaignPage.jsx` — compact, ~280 lines
2. No other files need changing (routes already wired)
