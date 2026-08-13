# Debug Session: gifted-sub-total

Status: OPEN

## Symptom
- Multi-gift community sub events are still being individualised instead of collapsing into one alert with the gifter name and total gifted count.

## Expected
- One alert only for a community gift burst, e.g. `Bobby gifted 5 subs`.

## Actual
- Recipient-level events are still surfacing, or the bulk total is not being recognised from the StreamElements payload shape being emitted live.

## Initial Hypotheses
1. The live StreamElements payload is not using `subscriber-gifted-latest` for community gifts, so the code is falling through the recipient path only.
2. The live gifted event does use `subscriber-gifted-latest`, but the total gifted count is stored under a different field than `amount` or `count`.
3. Multiple subscriber listener variants are arriving for the same community gift, and the current dedupe/fallback path is still allowing recipient-level alerts through.
4. The widget running in StreamElements does not actually contain the latest JS block from the draft, so the old recipient-alert behaviour is still live.
5. The preview/test path in StreamElements is emitting a different payload shape from real live gifted sub events.

## Evidence To Collect
- Actual `listener` names for gifted-sub events
- Actual gifted payload keys present in `event.data`
- Whether `buildAlert` is returning a bulk alert or `null` for recipient-derived events
- Whether `flushPendingGiftRecipients` or synthetic bulk grouping is being hit

## Evidence Summary
- The StreamElements event docs define `subscriber-gifted-latest.amount` as the number of gifted subs.
- The alert code was only grouping recipient-style gift events synthetically.
- Repeated `subscriber-gifted-latest` events were returned immediately as visible alerts, so close-together `amount: 1` bulk events from the same gifter never totalled together.

## Fix Applied
- Added a short aggregation window for `subscriber-gifted-latest`.
- Repeated bulk gifted events from the same gifter are now buffered and collapsed into one alert using the summed total.
- Recipient-derived gifted events still act as a fallback path when StreamElements only provides recipient-style payloads.

## Current Status
- User retested after the aggregation change.
- Symptom persists: gifted community subs are still not collapsing into one total alert.
- Most likely remaining cause: the live StreamElements gifted payload shape differs from the assumptions in the draft, so the aggregation path is still not matching the real event sequence.

## Additional Runtime Evidence
- User screenshot showed gifted traffic arriving through `subscriber-latest`, not just `subscriber-gifted-latest`.
- The console also showed `Skipped event after buildAlert` for `subscriber-latest`.
- That points to the old branch requiring a recipient name before doing anything, which causes bulk gift events without a recipient field to be ignored instead of aggregated.

## Follow-up Fix Applied
- Gift-derived `subscriber-*` events with a gifter but no recipient are now treated as bulk gifts.
- Those events are routed into the same short aggregation window as `subscriber-gifted-latest`, using the available gifted count fields.
