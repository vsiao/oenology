# jq -f 2020-07-28-MAMA.jq make-wine-gameLogs-export.json

map_values(
    to_entries as $entries |
    reduce ($entries | keys)[] as $i (
        .;
        $entries[$i].value as $action |
        $entries[$i].key as $actionKey |
        if
            # For each action with choice 'PAPA_A' or 'PAPA_B'...
            ($action.choice == "PAPA_A" or $action.choice == "PAPA_B")
                # ...not immediately preceded by choice 'MAMA'
                and $entries[$i - 1].value.choice != "MAMA"
        then . += {
            # Replace action with 'MAMA'. Using the same key is critical
            # as initial card shuffles are seeded by this key.
            ($actionKey): {
                playerId: $action.playerId,
                type: "CHOOSE_ACTION",
                choice: "MAMA"
            },
            # Add back 'PAPA_A' or 'PAPA_B' at a key immediately following
            ($actionKey + "_papa"): $action
        }
        else . end
    )
)
