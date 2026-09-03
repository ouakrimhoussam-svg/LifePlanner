/* =========================================
   LIFE PLANNER — FINAL VERSION 1.0
========================================= */


let selectedDate = new Date();

let tasks =
    JSON.parse(
        localStorage.getItem("lifePlannerTasks")
    ) || [];


// =========================================
// ELEMENTS
// =========================================

const timeline =
    document.getElementById("timeline");

const addTaskBtn =
    document.getElementById("addTaskBtn");

const taskModal =
    document.getElementById("taskModal");

const closeModal =
    document.getElementById("closeModal");

const taskForm =
    document.getElementById("taskForm");

const taskName =
    document.getElementById("taskName");

const startTime =
    document.getElementById("startTime");

const endTime =
    document.getElementById("endTime");

const taskCategory =
    document.getElementById("taskCategory");

const currentDate =
    document.getElementById("currentDate");

const currentDay =
    document.getElementById("currentDay");

const prevDay =
    document.getElementById("prevDay");

const nextDay =
    document.getElementById("nextDay");


// =========================================
// DAYS
// =========================================

const arabicDays = {
    0: "الأحد",
    1: "الاثنين",
    2: "الثلاثاء",
    3: "الأربعاء",
    4: "الخميس",
    5: "الجمعة",
    6: "السبت"
};


// =========================================
// DATE
// =========================================

function getDateKey(date) {

    return `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(2, "0")}-${String(
        date.getDate()
    ).padStart(2, "0")}`;

}


function formatDate(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    );

}


function getArabicDay(date) {

    return arabicDays[
        date.getDay()
    ];

}


// =========================================
// UPDATE PAGE
// =========================================

function updateDate() {

    currentDate.textContent =
        formatDate(selectedDate);


    const today =
        new Date();


    if (
        getDateKey(selectedDate) ===
        getDateKey(today)
    ) {

        currentDay.textContent =
            "Today";

    } else {

        currentDay.textContent =
            getArabicDay(selectedDate);

    }


    renderTimeline();

    updateDashboard();

    renderWeeklyChart();

}


// =========================================
// GET DAY TASKS
// =========================================

function getDayTasks(
    dateKey = getDateKey(selectedDate)
) {

    return tasks

        .filter(
            task =>
                task.date === dateKey
        )

        .sort(
            (a, b) =>
                timeToMinutes(a.start) -
                timeToMinutes(b.start)
        );

}


// =========================================
// TIME → MINUTES
// =========================================

function timeToMinutes(time) {

    if (!time) return 0;

    const parts =
        time.split(":");

    return (
        Number(parts[0]) * 60 +
        Number(parts[1])
    );

}


// =========================================
// TIMELINE
// =========================================

function renderTimeline() {

    timeline.innerHTML = "";


    const dayTasks =
        getDayTasks();


    /*
        لا نرسم 24 ساعة.

        نرسم فقط البرامج الموجودة.

        مثال:

        11:00 → 13:00
        التداول

        يظهر:

        11:00   التداول
                11:00 → 13:00

        13:00

        ولا تظهر 12:00 إطلاقًا.
    */


    dayTasks.forEach(task => {

        const row =
            document.createElement(
                "div"
            );

        row.className =
            "timeline-row";


        const time =
            document.createElement(
                "div"
            );

        time.className =
            "timeline-time";


        time.textContent =
            task.start;


        const content =
            document.createElement(
                "div"
            );

        content.className =
            "timeline-content";


        content.appendChild(
            createTaskElement(task)
        );


        row.appendChild(time);

        row.appendChild(content);


        timeline.appendChild(row);


        /*
            نهاية البرنامج.

            لا تعتبر برنامجًا جديدًا،
            وإنما مجرد نقطة النهاية.
        */

        if (
            task.end !==
            task.start
        ) {

            const endRow =
                document.createElement(
                    "div"
                );

            endRow.className =
                "timeline-row timeline-end-row";


            const endTime =
                document.createElement(
                    "div"
                );

            endTime.className =
                "timeline-time";


            endTime.textContent =
                task.end;


            const empty =
                document.createElement(
                    "div"
                );

            empty.className =
                "timeline-content";


            endRow.appendChild(
                endTime
            );

            endRow.appendChild(
                empty
            );


            timeline.appendChild(
                endRow
            );

        }

    });

}


// =========================================
// CREATE TASK
// =========================================

function createTaskElement(task) {

    const element =
        document.createElement(
            "div"
        );

    element.className =
        "task";


    if (task.completed) {

        element.classList.add(
            "completed"
        );

    }


    const info =
        document.createElement(
            "div"
        );

    info.className =
        "task-info";


    const title =
        document.createElement(
            "h3"
        );

    title.textContent =
        task.name;


    const details =
        document.createElement(
            "p"
        );


    details.textContent =
        `${task.start} → ${task.end} • ${task.category}`;


    info.appendChild(title);

    info.appendChild(details);


    const actions =
        document.createElement(
            "div"
        );

    actions.className =
        "task-actions";


    // COMPLETE

    const completeBtn =
        document.createElement(
            "button"
        );

    completeBtn.textContent =
        "✓";

    completeBtn.title =
        "إنجاز";


    completeBtn.addEventListener(
        "click",
        () => {

            task.completed =
                !task.completed;

            saveTasks();

            updateDate();

        }
    );


    // DELETE

    const deleteBtn =
        document.createElement(
            "button"
        );

    deleteBtn.textContent =
        "🗑";

    deleteBtn.title =
        "حذف";


    deleteBtn.addEventListener(
        "click",
        () => {

            tasks =
                tasks.filter(
                    item =>
                        item.id !==
                        task.id
                );

            saveTasks();

            updateDate();

        }
    );


    actions.appendChild(
        completeBtn
    );

    actions.appendChild(
        deleteBtn
    );


    element.appendChild(info);

    element.appendChild(actions);


    return element;

}


// =========================================
// DASHBOARD
// =========================================

function updateDashboard() {

    const dayTasks =
        getDayTasks();


    const total =
        dayTasks.length;


    const completed =
        dayTasks.filter(
            task =>
                task.completed
        ).length;


    let minutes = 0;


    dayTasks.forEach(task => {

        const start =
            timeToMinutes(
                task.start
            );

        const end =
            timeToMinutes(
                task.end
            );


        if (end > start) {

            minutes +=
                end - start;

        }

    });


    const rate =
        total === 0
            ? 0
            : Math.round(
                (completed / total) *
                100
            );


    document.getElementById(
        "totalTasks"
    ).textContent =
        total;


    document.getElementById(
        "completedTasks"
    ).textContent =
        completed;


    document.getElementById(
        "focusTime"
    ).textContent =
        `${Math.floor(minutes / 60)}h ${
            minutes % 60
        }m`;


    document.getElementById(
        "successRate"
    ).textContent =
        `${rate}%`;


    document.getElementById(
        "progressText"
    ).textContent =
        `${rate}%`;


    document.getElementById(
        "progressBar"
    ).style.width =
        `${rate}%`;

}


// =========================================
// WEEKLY CHART
// =========================================

function renderWeeklyChart() {

    const chart =
        document.getElementById(
            "weekChart"
        );


    chart.innerHTML = "";


    const base =
        new Date(selectedDate);


    const day =
        base.getDay();


    /*
        نحصل على يوم الاثنين
        باعتباره بداية الأسبوع.
    */

    const mondayOffset =
        day === 0
            ? -6
            : 1 - day;


    const week = [];


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const date =
            new Date(base);


        date.setDate(
            base.getDate() +
            mondayOffset +
            i
        );


        week.push(date);

    }


    const counts =
        week.map(date => {

            return getDayTasks(
                getDateKey(date)
            ).filter(
                task =>
                    task.completed
            ).length;

        });


    const max =
        Math.max(
            ...counts,
            1
        );


    week.forEach(
        (date, index) => {

            const column =
                document.createElement(
                    "div"
                );

            column.className =
                "day-column";


            const value =
                document.createElement(
                    "div"
                );

            value.className =
                "day-value";

            value.textContent =
                counts[index];


            const bar =
                document.createElement(
                    "div"
                );

            bar.className =
                "day-bar";


            bar.style.height =
                `${Math.max(
                    4,
                    (
                        counts[index] /
                        max
                    ) * 110
                )}px`;


            const label =
                document.createElement(
                    "div"
                );

            label.className =
                "day-label";


            label.textContent =
                getArabicDay(date);


            column.appendChild(
                value
            );

            column.appendChild(
                bar
            );

            column.appendChild(
                label
            );


            chart.appendChild(
                column
            );

        }
    );

}


// =========================================
// MODAL
// =========================================

addTaskBtn.addEventListener(
    "click",
    () => {

        taskModal.classList.remove(
            "hidden"
        );

        taskName.focus();

    }
);


closeModal.addEventListener(
    "click",
    () => {

        taskModal.classList.add(
            "hidden"
        );

    }
);


taskModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            taskModal
        ) {

            taskModal.classList.add(
                "hidden"
            );

        }

    }
);


// =========================================
// ADD TASK
// =========================================

taskForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const name =
            taskName.value.trim();


        const start =
            startTime.value;


        const end =
            endTime.value;


        if (!name) {

            return;

        }


        const startMinutes =
            timeToMinutes(start);


        const endMinutes =
            timeToMinutes(end);


        /*
            النهاية يجب أن تكون
            بعد البداية.
        */

        if (
            endMinutes <=
            startMinutes
        ) {

            alert(
                "يجب أن يكون وقت النهاية بعد وقت البداية."
            );

            return;

        }


        tasks.push({

            id:
                Date.now(),

            name:
                name,

            start:
                start,

            end:
                end,

            category:
                taskCategory.options[
                    taskCategory
                        .selectedIndex
                ].text,

            date:
                getDateKey(
                    selectedDate
                ),

            completed:
                false

        });


        saveTasks();


        taskForm.reset();


        taskModal.classList.add(
            "hidden"
        );


        updateDate();

    }
);


// =========================================
// PREVIOUS DAY
// =========================================

prevDay.addEventListener(
    "click",
    () => {

        selectedDate.setDate(
            selectedDate.getDate() -
            1
        );

        updateDate();

    }
);


// =========================================
// NEXT DAY
// =========================================

nextDay.addEventListener(
    "click",
    () => {

        selectedDate.setDate(
            selectedDate.getDate() +
            1
        );

        updateDate();

    }
);


// =========================================
// SAVE
// =========================================

function saveTasks() {

    localStorage.setItem(
        "lifePlannerTasks",
        JSON.stringify(tasks)
    );

}


// =========================================
// START
// =========================================

updateDate();