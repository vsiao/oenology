# Adds `startingPlayer: 0` to every `START_GAME` action
# jq -f 2020-08-15-startingPlayer.jq make-wine-gameLogs-export.json

map_values(
    to_entries as $entries |
    reduce ($entries | keys)[] as $i (
        .;
        $entries[$i].value as $action |
        $entries[$i].key as $actionKey |
        if
            $action.type == "START_GAME"
        then
            .[$actionKey] |=
                (.startingPlayer = 0)
        else . end
    )
)
