const icon_width = 79,
    icon_height = 79,
    num_icons = 9,
    time_per_icon = 100,
    indexes = [0, 0, 0, 0, 0],
    iconMap = ['banana', 'seven', 'cherry', 'plam', 'orange', 'bell', 'bar', 'lemon', 'melon'];

const roll = (reel, offset = 0) => {
    const delta = (offset + 2) * num_icons + Math.round(Math.random() * num_icons);

    const style = getComputedStyle(reel),
        backgroundPositionY = parseFloat(style["backgroundPositionY"]),
        targetBackgroundPositionY = backgroundPositionY + delta * icon_height,
        normalTargetBackgroundPositionY = targetBackgroundPositionY % (num_icons * icon_height);

    return new Promise((resolve, reject) => {
        reel.style.transition = `background-position-y ${8 + delta * time_per_icon}ms cubic-bezier(.41,-0.01,.63,1.09)`;
        reel.style.backgroundPositionY = `${targetBackgroundPositionY}px`;

        setTimeout(() => {
            reel.style.transition = `none`;
            reel.style.backgroundPositionY = `${normalTargetBackgroundPositionY}px`;
            resolve(delta % num_icons);
        }, 8 + delta * time_per_icon);
    })
}

function rollAll() {
    const reelsList = document.querySelectorAll('.slots > .reel');

    Promise
        .all([...reelsList].map((reel, i) => roll(reel, i)))
        .then((deltas) => {
            deltas.forEach((delta, i) => indexes[i] = (indexes[i] + delta) % num_icons);
            indexes.map((index) => console.log(iconMap[index]));

            // check win conditions
            if (indexes[0] == indexes[1] || indexes[1] == indexes[2]) {
                const winCls = indexes[0] == indexes[2] ? "win2" : "win1";
                document.querySelector(".slots").classList.add(winCls);
                setTimeout(() => document.querySelector(".slots").classList.remove(winCls), 2000)
            }
            setTimeout(rollAll, 3000)
        })
}

rollAll();
