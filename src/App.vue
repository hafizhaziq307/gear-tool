<template>
    <main class="max-w-4xl px-4 py-4 mx-auto space-y-6 text-gray-100 lg:px-0">
        <section class="grid grid-cols-3 grid-rows-3 gap-6">
            <!-- input -->
            <div
                class="row-span-2 p-4 bg-gray-800 rounded-md col-span-full md:row-span-full md:col-span-2 ring-1 ring-gray-600"
            >
                <div class="grid grid-cols-2 gap-x-4 gap-y-6">
                    <template v-for="(subType, index) in subTypes" :key="index">
                        <article>
                            <p class="ml-1 capitalize sm:text-lg">{{ subType.name }}</p>
                            <input
                                type="text"
                                v-model="subType.base"
                                placeholder="0"
                                class="w-full px-4 py-2 rounded-md focus:ring-1 focus:ring-blue-600 sm:text-xl"
                                :class="(subType.base == '')? 'bg-gray-900' : 'bg-gray-700'"
                            />
                        </article>
                    </template>
                </div>
            </div>

            <!-- total score -->
            <div
                class="grid col-span-2 p-4 text-3xl bg-gray-800 rounded-md md:col-span-1 place-content-center md:row-span-2 ring-1 ring-gray-600 sm:text-4xl"
            >
                <strong>{{ ((total / 72 * 100).toFixed(1)) * 1 }} %</strong>
            </div>

            <!-- buttons -->
            <div
                class="flex flex-col justify-center p-4 space-y-3 bg-gray-800 rounded-md ring-1 ring-gray-600"
            >
                <button
                    @click="calculate()"
                    class="px-4 py-2 text-lg font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 sm:text-xl"
                >Calc</button>

                <button
                    @click="clear()"
                    class="px-4 py-2 text-lg font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 sm:text-xl"
                >Clear</button>
            </div>
        </section>

        <!-- stat details table -->
        <section
            class="inline-block min-w-full overflow-hidden rounded-md ring-1 ring-gray-600"
            v-if="total !== 0"
        >
            <table class="min-w-full leading-normal">
                <thead class="text-sm sm:text-base">
                    <tr class="uppercase bg-gray-800">
                        <th class="px-5 py-3 text-center">Sub</th>
                        <th class="px-5 py-3 text-center">Roll</th>
                        <th class="px-5 py-3 text-center">Point</th>
                        <th class="px-5 py-3 text-center">Lost</th>
                    </tr>
                </thead>
                <tbody class="sm:text-lg">
                    <template v-for="(subType, index) in filteredOutput(subTypes)" :key="index">
                        <tr class="bg-gray-700">
                            <td class="px-5 py-4">{{ subType.name }}</td>
                            <td class="px-5 py-4 text-center">x {{ subType.totalRoll }}</td>
                            <td
                                class="px-5 py-4 text-center"
                            >{{ subType.score }}/{{ subType.currentMaxRoll }}</td>
                            <td class="px-5 py-4 text-center">{{ subType.lostPoint}}</td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </section>
    </main>
</template>

<script>
document.body.style.backgroundColor = "#18181B";

export default {
    name: "App",
    data() {
        return {
            total: 0,
            subTypes: [
                {
                    name: "atk",
                    base: "",
                    score: 0,
                    currentMaxRoll: 0,
                    lostPoint: "",
                    rate: 1,
                    totalRoll: 0,
                    roll: [8, 16, 24, 32, 40, 48],
                },
                {
                    name: "def",
                    base: "",
                    score: 0,
                    currentMaxRoll: 0,
                    lostPoint: "",
                    rate: 1,
                    totalRoll: 0,
                    roll: [8, 16, 24, 32, 40, 48],
                },
                {
                    name: "hp",
                    base: "",
                    score: 0,
                    currentMaxRoll: 0,
                    lostPoint: "",
                    rate: 1,
                    totalRoll: 0,
                    roll: [8, 16, 24, 32, 40, 48],
                },
                {
                    name: "speed",
                    base: "",
                    score: 0,
                    currentMaxRoll: 0,
                    lostPoint: "",
                    rate: 2,
                    totalRoll: 0,
                    roll: [4, 8, 12, 16, 20, 24],
                },
                {
                    name: "eff",
                    base: "",
                    score: 0,
                    currentMaxRoll: 0,
                    lostPoint: "",
                    rate: 1,
                    totalRoll: 0,
                    roll: [8, 16, 24, 32, 40, 48],
                },

                {
                    name: "eff Res",
                    base: "",
                    score: 0,
                    currentMaxRoll: 0,
                    lostPoint: "",
                    rate: 1,
                    totalRoll: 0,
                    roll: [8, 16, 24, 32, 40, 48],
                },
                {
                    name: "crit dmg",
                    base: "",
                    score: 0,
                    currentMaxRoll: 0,
                    lostPoint: "",
                    rate: 1.14,
                    totalRoll: 0,
                    roll: [7, 14, 21, 28, 35, 42],
                },

                {
                    name: "crit rate",
                    base: "",
                    score: 0,
                    currentMaxRoll: 0,
                    lostPoint: "",
                    rate: 1.6,
                    totalRoll: 0,
                    roll: [5, 10, 15, 20, 25, 30],
                },
            ],
        };
    },
    methods: {
        calculate() {
            // remove empty input from calculation
            let filteredSubtypes = this.filteredInput(this.subTypes);

            // loop through sub type
            filteredSubtypes.forEach((subtype) => {
                let point = Number(subtype.base);

                // loop through rolls
                for (let i = 0; i < subtype.roll.length; i++) {
                    const maxPoint = subtype.roll[i];

                    if (point <= maxPoint) {
                        subtype.score = point;
                        subtype.currentMaxRoll = maxPoint;
                        subtype.totalRoll = i;
                        subtype.lostPoint = maxPoint - point;
                        break;
                    }
                }
            });

            this.total = this.rateGear(filteredSubtypes);
        },

        clear() {
            this.total = 0;

            this.subTypes.forEach((subtype) => {
                subtype.base = "";
                subtype.score = 0;
                subtype.currentMaxRoll = 0;
                subtype.lostPoint = 0;
                subtype.totalRoll = 0;
            });
        },

        rateGear(items) {
            return items.reduce(function (previousValue, currentValue) {
                return (
                    previousValue +
                    Number(currentValue.base) * currentValue.rate
                );
            }, 0);
        },

        filteredInput(items) {
            return items.filter(function (item) {
                return item.base !== "";
            });
        },

        filteredOutput(items) {
            return items.filter(function (item) {
                return item.score !== 0;
            });
        },
    },
};
</script>
