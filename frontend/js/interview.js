/**
 * DRON AI: Interview Preparation & Question Hub Controller
 * Manages:
 *   - Curated real-world question bank across 6 domains (DSA, Core CS, Web, AI/ML, SysDesign, HR)
 *   - Dynamic domain, company, difficulty filtering & live keyword search
 *   - Expandable model answers, recruiter insights, and red flag warnings
 *   - Interactive "Practice Your Answer" scratchpad with keyword recognition & score feedback
 *   - "Mark as Mastered" persistence via localStorage
 *   - Real-world CTC vs In-Hand Salary Calculator
 *   - Interactive STAR Behavioral Answer Builder with presets and copy feature
 */

// ═══════════════════════════════════════════════════════════════
// Curated Question Bank Data (Real Campus Interview Questions)
// ═══════════════════════════════════════════════════════════════
const INTERVIEW_QUESTIONS = [
    {
        id: "q-dsa-1",
        title: "Two Sum & Two-Pointer Optimizations (Sorted vs Unsorted)",
        domain: "dsa",
        domainLabel: "DSA & Problem Solving",
        companyType: "product",
        companyTags: ["Amazon", "Flipkart", "TCS Digital"],
        difficulty: "fresher",
        difficultyLabel: "Campus / Fresher",
        frequency: "Asked in 85% of technical rounds",
        recruiterInsight: "Recruiters use this deceptively simple question to gauge your immediate reflex to check for time-space trade-offs. If you jump straight to O(N²) nested loops without mentioning Hash Map O(N) or Two Pointers O(N log N), you lose points immediately.",
        keyPoints: [
            "Brute Force O(N²) nested loops baseline",
            "Hash Map (Complement lookup) for O(N) time and O(N) space",
            "Two Pointer approach if array is sorted (O(1) auxiliary space)",
            "Handling duplicates and integer overflow edge cases"
        ],
        modelAnswer: `<strong>1. Approach & Communication:</strong><br>
When asked this, start by asking: <em>"Is the array sorted, and can there be duplicate elements?"</em><br><br>
<strong>2. Optimal Solution (Hash Map):</strong><br>
We iterate through the array once. For each element <code>nums[i]</code>, we calculate the required complement: <code>complement = target - nums[i]</code>.<br>
If the complement is already in our hash map, we return <code>[map.get(complement), i]</code>. Otherwise, we record the current element and its index in the map.<br><br>
<code>// Time Complexity: O(N) single pass<br>// Space Complexity: O(N) for hash map</code><br><br>
<strong>3. Sorted Array Variation (Two Pointers):</strong><br>
If the array is already sorted, we initialize <code>left = 0</code> and <code>right = n - 1</code>. If <code>nums[left] + nums[right] == target</code>, we are done. If the sum is smaller than target, increment <code>left++</code>; if larger, decrement <code>right--</code>. This achieves <strong>O(N) time with O(1) space</strong>.`,
        redFlags: "Never write an O(N²) nested loop and submit it without verbally stating that it's suboptimal. Don't forget that hash map lookup is average O(1) but worst-case O(N) if hash collisions occur.",
        keywords: ["hash map", "complement", "two pointer", "o(n)", "space complexity", "sorted", "time complexity"]
    },
    {
        id: "q-dsa-2",
        title: "Detect and Find the Starting Node of a Cycle in a Linked List",
        domain: "dsa",
        domainLabel: "DSA & Problem Solving",
        companyType: "product",
        companyTags: ["Microsoft", "Amazon", "Adobe"],
        difficulty: "intermediate",
        difficultyLabel: "Tech Round 2 (Medium)",
        frequency: "Top 10 Classic DSA question",
        recruiterInsight: "Tests Floyd's Cycle Detection Algorithm (Tortoise and Hare) and whether you can mathematically prove why resetting one pointer to head and moving both at speed 1 lands exactly at the cycle entrance.",
        keyPoints: [
            "Slow pointer moves 1 step, fast pointer moves 2 steps",
            "Proof of meeting point inside cycle",
            "Reset one pointer to head, advance both by 1 step to find entry node",
            "Handling null / single node lists without NullPointerException"
        ],
        modelAnswer: `<strong>1. Detection Phase (Floyd's Algorithm):</strong><br>
Initialize <code>slow = head</code> and <code>fast = head</code>. In a loop, advance <code>slow = slow.next</code> and <code>fast = fast.next.next</code>. If <code>fast == null || fast.next == null</code>, there is no cycle. If <code>slow == fast</code>, a cycle is confirmed.<br><br>
<strong>2. Mathematical Proof of Starting Node:</strong><br>
Let distance from head to cycle start be <strong>L1</strong>. Let distance from start to meeting point be <strong>L2</strong>, and remaining cycle length be <strong>C - L2</strong>.<br>
Distance traveled by slow = L1 + L2.<br>
Distance traveled by fast = L1 + L2 + n*C.<br>
Since fast moves twice as fast: 2(L1 + L2) = L1 + L2 + n*C &rArr; <strong>L1 = n*C - L2</strong>.<br><br>
<strong>3. Finding the Start:</strong><br>
Reset <code>slow = head</code> while leaving <code>fast</code> at the meeting point. Advance both one step at a time. The node where they meet is the start of the cycle.`,
        redFlags: "Using a HashSet to store visited nodes is acceptable for brute force O(N) space, but immediately follow up with Floyd's algorithm for O(1) space.",
        keywords: ["floyd", "tortoise", "slow", "fast", "cycle", "o(1) space", "pointer", "mathematical"]
    },
    {
        id: "q-core-1",
        title: "DBMS: Clustered vs Non-Clustered Indexes and B+ Tree Architecture",
        domain: "core-cs",
        domainLabel: "Core CS (DBMS/OS/CN)",
        companyType: "mass",
        companyTags: ["TCS Digital", "Infosys DSE", "Capgemini", "Oracle"],
        difficulty: "fresher",
        difficultyLabel: "Campus / Fresher",
        frequency: "Asked in 90% of campus service & product drives",
        recruiterInsight: "This separates students who only know SQL syntax from those who understand database storage engines. Interviewers love asking why a table can have only one clustered index.",
        keyPoints: [
            "Clustered index physically sorts and stores data rows in the table",
            "Only ONE clustered index per table (typically Primary Key)",
            "Non-clustered index creates a separate B+ tree storing pointers to actual data rows",
            "Why B+ Tree is preferred over Binary Search Tree or B Tree (sequential range scans)"
        ],
        modelAnswer: `<strong>1. Core Physical Distinction:</strong><br>
A <strong>Clustered Index</strong> defines the physical storage order of rows on the disk. Because physical data can only be sorted in one order, a table can have <strong>only one clustered index</strong> (by default on the Primary Key). The leaf nodes of the B+ tree contain the actual data rows.<br><br>
A <strong>Non-Clustered Index</strong> is stored separately from the data rows. Its leaf nodes contain index keys and a row locator (pointer/RID or primary key value) pointing to where the actual row lives. A table can have multiple non-clustered indexes.<br><br>
<strong>2. Why B+ Trees instead of Binary Trees or B Trees?</strong><br>
&bull; <strong>High Fanout:</strong> B+ trees have large branching factors, meaning tree height is usually 3 to 4 levels even for millions of rows, minimizing disk I/O reads.<br>
&bull; <strong>Sequential Range Scans:</strong> In a B+ tree, all data resides in the leaf nodes, which are linked together in a doubly-linked list. Range queries (e.g. <code>WHERE salary BETWEEN 50000 AND 80000</code>) simply traverse leaves without jumping up and down internal nodes.`,
        redFlags: "Saying a table can have multiple clustered indexes. Not knowing that leaf nodes in B+ trees are linked for range queries.",
        keywords: ["clustered", "non-clustered", "b+ tree", "leaf nodes", "physical order", "pointer", "disk i/o", "primary key"]
    },
    {
        id: "q-core-2",
        title: "Operating Systems: Process vs Thread, Context Switching & 4 Coffman Conditions",
        domain: "core-cs",
        domainLabel: "Core CS (DBMS/OS/CN)",
        companyType: "mass",
        companyTags: ["Samsung", "TCS Digital", "Qualcomm", "Wipro Turbo"],
        difficulty: "fresher",
        difficultyLabel: "Campus / Fresher",
        frequency: "Asked in 80% of Core CS interviews",
        recruiterInsight: "Interviewers want to see if you understand memory isolation (PCB vs TCB, virtual address space) and the real cost of multithreading.",
        keyPoints: [
            "Process has independent address space; Thread shares address space of its parent process",
            "Threads share heap, code, and data; each thread has its own stack and registers (PC)",
            "Context switching between processes invalidates CPU cache / TLB; thread switching is lightweight",
            "4 Coffman conditions for Deadlock: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait"
        ],
        modelAnswer: `<strong>1. Process vs Thread:</strong><br>
A <strong>Process</strong> is an executing program with its own dedicated virtual memory space, PCB (Process Control Block), file descriptors, and environment.<br>
A <strong>Thread</strong> is the smallest unit of CPU execution within a process. Multiple threads share the process's code, data, and heap segments, but each thread possesses its own <strong>Program Counter, Register set, and Stack</strong>.<br><br>
<strong>2. Context Switching Overhead:</strong><br>
Switching between processes requires saving and restoring memory mappings, which invalidates the Translation Lookaside Buffer (TLB) and CPU L1/L2 caches. Thread context switching inside the same process does not invalidate the TLB, making it drastically faster.<br><br>
<strong>3. 4 Coffman Conditions for Deadlock:</strong><br>
A deadlock can occur if and only if all 4 conditions hold simultaneously:<br>
1. <strong>Mutual Exclusion:</strong> At least one resource must be non-shareable.<br>
2. <strong>Hold & Wait:</strong> A process holds at least one resource and waits to acquire others.<br>
3. <strong>No Preemption:</strong> Resources cannot be forcibly taken from a process.<br>
4. <strong>Circular Wait:</strong> A closed chain of processes exists where each waits for a resource held by the next. (Prevented by resource ordering).`,
        redFlags: "Saying threads share their stack (each thread has its private call stack!). Forgetting the names of the 4 Coffman conditions.",
        keywords: ["process", "thread", "virtual memory", "tlb", "context switch", "coffman", "deadlock", "mutual exclusion", "stack"]
    },
    {
        id: "q-web-1",
        title: "REST vs GraphQL vs gRPC: Architecture Trade-Offs in Modern Backends",
        domain: "web",
        domainLabel: "Web & Fullstack",
        companyType: "startup",
        companyTags: ["Razorpay", "Zomato", "Swiggy", "Paytm"],
        difficulty: "intermediate",
        difficultyLabel: "Tech Round 2 (Medium)",
        frequency: "Standard Fullstack & Backend round question",
        recruiterInsight: "Tests whether you understand practical API design and network overhead rather than just memorizing buzzwords.",
        keyPoints: [
            "REST: Stateless, HTTP verbs, caching via HTTP headers, prone to over/under-fetching",
            "GraphQL: Single endpoint, client defines exact response shape, eliminates over-fetching",
            "gRPC: HTTP/2 transport, Protocol Buffers binary serialization, low latency microservices",
            "When to choose which in production"
        ],
        modelAnswer: `<strong>1. REST (Representational State Transfer):</strong><br>
Standard resource-based architecture using HTTP verbs (GET, POST, PUT, DELETE). Strengths: universal client support, straightforward edge caching (CDNs, Cache-Control). Weakness: Over-fetching (getting 50 fields when you need 2) or under-fetching (requiring 3 round trips to fetch user, orders, and addresses).<br><br>
<strong>2. GraphQL:</strong><br>
A declarative query language over a single POST endpoint. Clients specify the exact fields needed. Eliminates over-fetching; ideal for mobile apps where bandwidth is scarce. Drawback: Difficult HTTP-level caching, potential N+1 database query issues if Dataloaders aren't used.<br><br>
<strong>3. gRPC (Google Remote Procedure Call):</strong><br>
Built on HTTP/2 with binary serialization via Protocol Buffers. Features multiplexing, bidirectional streaming, and strictly typed contracts (.proto files). It is 5x to 8x faster than REST over JSON, making it the industry standard for <strong>internal microservice-to-microservice communication</strong>.`,
        redFlags: "Claiming GraphQL replaces REST everywhere. Caching dynamic GraphQL queries at the CDN layer is complex.",
        keywords: ["rest", "graphql", "grpc", "protocol buffers", "http/2", "over-fetching", "caching", "microservices"]
    },
    {
        id: "q-aiml-1",
        title: "Handling High Variance & Overfitting in Gradient Boosted Trees (XGBoost)",
        domain: "aiml",
        domainLabel: "AI / ML & Data",
        companyType: "product",
        companyTags: ["Amazon", "Fractal Analytics", "Mu Sigma", "Dron AI Core"],
        difficulty: "intermediate",
        difficultyLabel: "Tech Round 2 (Medium)",
        frequency: "Core ML Engineer & Placement Predictor benchmark",
        recruiterInsight: "Directly relates to the architecture used in Dron AI's placement predictor! Recruiters want to know if you understand regularization parameters in tree-based ensembles.",
        keyPoints: [
            "Definition of High Variance: Low training error, high validation/test error",
            "Hyperparameter tuning: max_depth, min_child_weight, learning_rate (eta)",
            "Subsampling: subsample and colsample_bytree (feature bagging)",
            "L1 (reg_alpha) and L2 (reg_lambda) tree leaf regularization"
        ],
        modelAnswer: `<strong>1. Identifying High Variance:</strong><br>
High variance occurs when an XGBoost model memorizes the training data noise instead of general patterns. Diagnostic sign: Training accuracy is 99% while validation accuracy is 78%.<br><br>
<strong>2. Remediation Strategies in XGBoost:</strong><br>
&bull; <strong>Control Tree Complexity:</strong> Lower <code>max_depth</code> (e.g. from 8 down to 3–5) to restrict individual tree expressiveness. Increase <code>min_child_weight</code> to prevent splits on tiny leaf partitions.<br>
&bull; <strong>Stochastic Regularization:</strong> Set <code>subsample=0.8</code> (sample 80% rows per tree) and <code>colsample_bytree=0.8</code> (sample 80% features per tree) to introduce bagging randomness.<br>
&bull; <strong>Shrinkage (Learning Rate):</strong> Reduce <code>learning_rate (eta)</code> from 0.3 down to 0.05 and use Early Stopping with validation rounds.<br>
&bull; <strong>Mathematical Regularization:</strong> Tune <code>reg_lambda</code> (L2 regularization) and <code>reg_alpha</code> (L1 regularization) on leaf weights.`,
        redFlags: "Confusing bagging (Random Forest) with boosting (XGBoost). Believing that adding more boosting trees fixes overfitting (it usually worsens it without early stopping!).",
        keywords: ["xgboost", "overfitting", "high variance", "max_depth", "learning rate", "colsample", "regularization", "early stopping"]
    },
    {
        id: "q-sysdesign-1",
        title: "Design a Scalable URL Shortener (TinyURL) with Sub-50ms Redirection",
        domain: "sysdesign",
        domainLabel: "System Design",
        companyType: "product",
        companyTags: ["Amazon", "PhonePe", "Atlassian", "Uber"],
        difficulty: "advanced",
        difficultyLabel: "Advanced / System Level",
        frequency: "Classic System Design Interview question",
        recruiterInsight: "Tests capacity estimation, Base62 encoding, collision resolution, and caching layers (Redis) for high read-to-write ratios.",
        keyPoints: [
            "Read-to-Write ratio is heavy (e.g. 100:1 read heavy)",
            "Base62 encoding (a-z, A-Z, 0-9) yielding 62^7 &approx; 3.5 trillion unique URLs",
            "Counter-based Range Generation Service (ZooKeeper or Redis) vs MD5/SHA-256 hashing",
            "Redis cache in front of PostgreSQL/Cassandra for hot URLs"
        ],
        modelAnswer: `<strong>1. Clarifying Requirements & Scale:</strong><br>
Assume 500 million new URLs created per month, 100:1 read ratio (50 billion redirects/month). Redirection latency must be &lt; 50ms.<br><br>
<strong>2. Short URL Encoding Strategy:</strong><br>
Using Base62 characters [0-9, a-z, A-Z], a 7-character string gives 62<sup>7</sup> &approx; 3.52 Trillion URLs. Rather than hashing the long URL (which requires collision resolution), use an <strong>Auto-incrementing Distributed Counter Service</strong> (Token Range Server via Apache ZooKeeper). Each worker node gets a range of 1,000,000 IDs to encode into Base62 without collisions.<br><br>
<strong>3. Storage & Caching Layer:</strong><br>
Schema: <code>{ short_hash (PK), original_url, created_at, expires_at, user_id }</code>.<br>
Store in NoSQL (e.g. DynamoDB/Cassandra) keyed by <code>short_hash</code>. Place a <strong>Redis Cache</strong> using LRU eviction in front of the database. Since 20% of URLs generate 80% of read traffic, caching the top 20% achieves sub-10ms read redirections.`,
        redFlags: "Storing URLs only in relational DB with no cache. Not explaining how to handle hash collisions or how distributed ID generators work.",
        keywords: ["tinyurl", "base62", "redis", "cache", "zookeeper", "read heavy", "dynamodb", "hash"]
    },
    {
        id: "q-hr-1",
        title: "STAR Method: 'Tell me about a time you handled a severe project conflict or failure'",
        domain: "hr",
        domainLabel: "HR & Behavioral (STAR)",
        companyType: "product",
        companyTags: ["Amazon (LP)", "Microsoft", "TCS Digital", "Infosys"],
        difficulty: "fresher",
        difficultyLabel: "Campus / Fresher",
        frequency: "Mandatory in Amazon, Google & Campus HR rounds",
        recruiterInsight: "Interviewers are not looking for someone who never made a mistake; they want emotional maturity, ownership, constructive conflict resolution, and objective data-driven decision making.",
        keyPoints: [
            "Situation: Context of the project, deadline, and differing opinions",
            "Task: What needed to be resolved without impacting deliverables",
            "Action: De-escalating emotions, using benchmarks/testing to decide objectively",
            "Result: Successful delivery, metric improvement, and strengthened peer relationship"
        ],
        modelAnswer: `<strong>[Situation]</strong> During our 3rd-year capstone project building a machine learning student guidance portal, our team was divided on whether to build a complex microservices architecture or a clean modular monolithic API.<br><br>
<strong>[Task]</strong> As backend lead, we had a hard 3-week deadline for internal college evaluation. Arguing over architecture was stalling development, and we risked missing our submission.<br><br>
<strong>[Action]</strong> Instead of debating opinions, I called a 30-minute sync. I benchmarked our actual constraints: team size (3 students), deployment budget ($0 free tier), and expected throughput. I showed that a modular monolith would let us ship in 10 days while isolating database schemas cleanly. If we needed to extract services later, our code was already modularized.<br><br>
<strong>[Result]</strong> The team aligned immediately on the data. We shipped 4 days ahead of schedule, achieved an 'A' grade from our faculty panel, and our code scored &lt;2ms inference latency. My teammate and I continued collaborating on subsequent hackathons.`,
        redFlags: "Blaming a teammate ('He was lazy/incompetent'). Saying 'I was right and everyone else was wrong'. Failing to quantify the result.",
        keywords: ["situation", "task", "action", "result", "conflict", "ownership", "data-driven", "teamwork"]
    },
    {
        id: "q-hr-2",
        title: "'Your CGPA is 7.4 while other applicants have 9.0+. Why should we hire you?'",
        domain: "hr",
        domainLabel: "HR & Behavioral (STAR)",
        companyType: "mass",
        companyTags: ["TCS Ninja/Digital", "Infosys", "Wipro", "Tech Startups"],
        difficulty: "fresher",
        difficultyLabel: "Campus / Fresher",
        frequency: "Classic campus recruiter stress test question",
        recruiterInsight: "Recruiters test your self-worth and confidence under pressure. If you apologize or sound defensive, you fail. If you demonstrate proven practical engineering and problem-solving beyond rote theory, you win.",
        keyPoints: [
            "Acknowledge GPA honestly without making excuses",
            "Pivot immediately to practical application (GitHub, live projects, LeetCode, internships)",
            "Explain how production experience and debugging speed translate directly to company revenue",
            "Express continuous learning mindset"
        ],
        modelAnswer: `<em>"That is a completely valid question. While my CGPA reflects consistent academic standing above our campus eligibility criteria, my primary engineering focus was on <strong>practical application and production engineering</strong>.<br><br>
While balancing coursework, I committed over 180+ contributions on GitHub, solved 240+ LeetCode problems with a focus on graph and dynamic programming patterns, and deployed a live machine learning guidance engine that processes real data.<br><br>
A 9.0 CGPA shows strong theoretical discipline, which I respect; however, my profile demonstrates that on Day 1 at your company, I won't need months of training on Git, REST APIs, or debugging production stack traces. I can start shipping tested, reliable features immediately."</em>`,
        redFlags: "Criticizing college professors ('The grading was unfair'). Disrespecting high-CGPA peers. Sounding arrogant instead of humble and capable.",
        keywords: ["practical", "production", "github", "leetcode", "shipping code", "debugging", "day 1", "confidence"]
    }
];

// ═══════════════════════════════════════════════════════════════
// LocalStorage Persistence for Mastered Questions
// ═══════════════════════════════════════════════════════════════
const STORAGE_KEY_MASTERED = "dron_mastered_questions";

function getMasteredQuestions() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_MASTERED);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.warn("Could not read mastered questions:", e);
        return [];
    }
}

function toggleQuestionMastered(questionId) {
    const list = getMasteredQuestions();
    const index = list.indexOf(questionId);
    if (index >= 0) {
        list.splice(index, 1);
    } else {
        list.push(questionId);
    }
    localStorage.setItem(STORAGE_KEY_MASTERED, JSON.stringify(list));
    updateMasteredRibbon();
    return list.includes(questionId);
}

function updateMasteredRibbon() {
    const mastered = getMasteredQuestions();
    const total = INTERVIEW_QUESTIONS.length;
    const countEl = document.getElementById("kpi-mastered-count");
    const pctEl = document.getElementById("kpi-mastered-pct");

    if (countEl) countEl.textContent = `${mastered.length}`;
    if (pctEl) {
        const pct = Math.round((mastered.length / total) * 100);
        pctEl.textContent = `${pct}% of Question Bank`;
    }
}

// ═══════════════════════════════════════════════════════════════
// Render Questions with Interactive Features
// ═══════════════════════════════════════════════════════════════
function renderInterviewQuestions(questionsToRender) {
    const container = document.getElementById("questionsContainer");
    if (!container) return;

    if (!questionsToRender || questionsToRender.length === 0) {
        container.innerHTML = `
            <div class="empty-questions-state">
                <i class="fa-solid fa-folder-open empty-icon"></i>
                <h3>No matching interview questions found</h3>
                <p>Try searching with another keyword or resetting the category &amp; company filters.</p>
                <button class="btn btn-outline btn-small" id="resetFiltersBtn">
                    <i class="fa-solid fa-rotate-left"></i> Reset All Filters
                </button>
            </div>
        `;
        const resetBtn = document.getElementById("resetFiltersBtn");
        if (resetBtn) {
            resetBtn.addEventListener("click", resetAllFilters);
        }
        return;
    }

    const masteredList = getMasteredQuestions();

    const html = questionsToRender.map((q, idx) => {
        const isMastered = masteredList.includes(q.id);
        const companyBadges = q.companyTags.map(tag => `<span class="company-tag"><i class="fa-solid fa-building"></i> ${tag}</span>`).join(" ");
        const keyPointsList = q.keyPoints.map(kp => `<li><i class="fa-solid fa-circle-check"></i> <span>${kp}</span></li>`).join("");

        return `
            <article class="question-card ${isMastered ? 'is-mastered' : ''}" id="card-${q.id}" data-id="${q.id}">
                <!-- Card Header -->
                <div class="question-card-header">
                    <div class="card-meta-row">
                        <span class="domain-pill domain-${q.domain}">
                            ${q.domainLabel}
                        </span>
                        <span class="difficulty-pill diff-${q.difficulty}">
                            ${q.difficultyLabel}
                        </span>
                        <span class="frequency-text">
                            <i class="fa-solid fa-fire text-amber"></i> ${q.frequency}
                        </span>
                    </div>

                    <div class="card-action-btns">
                        <button class="master-toggle-btn ${isMastered ? 'active' : ''}" data-id="${q.id}" title="Toggle mastered status">
                            <i class="${isMastered ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'}"></i>
                            <span>${isMastered ? 'Mastered' : 'Mark as Mastered'}</span>
                        </button>
                    </div>
                </div>

                <!-- Question Title -->
                <h3 class="question-title">${q.title}</h3>

                <!-- Company Tags -->
                <div class="company-tags-row">
                    <span class="tags-label">Frequently Asked In:</span>
                    ${companyBadges}
                </div>

                <!-- Recruiter Mindset Accordion / Insight -->
                <div class="recruiter-insight-box">
                    <div class="insight-label">
                        <i class="fa-solid fa-user-tie"></i>
                        <span>Why Interviewers Ask This:</span>
                    </div>
                    <p class="insight-text">${q.recruiterInsight}</p>
                </div>

                <!-- Key Checklist Points -->
                <div class="key-points-wrap">
                    <span class="points-header"><i class="fa-solid fa-list-check"></i> Must-Cover Key Talking Points:</span>
                    <ul class="points-list">
                        ${keyPointsList}
                    </ul>
                </div>

                <!-- Model Answer Accordion Trigger -->
                <div class="model-answer-section">
                    <button class="toggle-answer-btn" data-target="drawer-${q.id}">
                        <div class="btn-left">
                            <i class="fa-solid fa-lightbulb"></i>
                            <span>Reveal Recruiter-Approved Model Answer</span>
                        </div>
                        <i class="fa-solid fa-chevron-down arrow-icon"></i>
                    </button>

                    <div class="answer-drawer" id="drawer-${q.id}">
                        <div class="drawer-inner">
                            <div class="model-answer-body">
                                ${q.modelAnswer}
                            </div>

                            <div class="red-flag-alert">
                                <div class="red-flag-title">
                                    <i class="fa-solid fa-triangle-exclamation"></i>
                                    <span>Rookie Red Flag to Avoid:</span>
                                </div>
                                <p class="red-flag-desc">${q.redFlags}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Interactive Practice Scratchpad -->
                <div class="interactive-practice-box">
                    <div class="practice-box-header">
                        <span class="practice-title">
                            <i class="fa-solid fa-keyboard"></i>
                            <span>Self-Practice Scratchpad: Test Your Answer</span>
                        </span>
                        <span class="practice-score-badge" id="score-${q.id}">Unchecked</span>
                    </div>

                    <textarea class="practice-textarea" id="textarea-${q.id}" rows="3" placeholder="Type your quick explanation or key keywords in your own words..."></textarea>

                    <div class="practice-actions">
                        <button class="btn btn-outline btn-small check-answer-btn" data-id="${q.id}">
                            <i class="fa-solid fa-spell-check"></i>
                            <span>Analyze Keywords</span>
                        </button>
                        <span class="practice-feedback" id="feedback-${q.id}">Mention key concepts above to check your coverage.</span>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    container.innerHTML = html;

    // Attach Event Listeners to rendered cards
    attachQuestionCardListeners();
}

function attachQuestionCardListeners() {
    // 1. Toggle Model Answer Drawer
    document.querySelectorAll(".toggle-answer-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const drawerId = btn.getAttribute("data-target");
            const drawer = document.getElementById(drawerId);
            const icon = btn.querySelector(".arrow-icon");

            if (drawer) {
                const isOpen = drawer.classList.contains("open");
                drawer.classList.toggle("open", !isOpen);
                if (icon) {
                    icon.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
                }
            }
        });
    });

    // 2. Toggle Mastered Status
    document.querySelectorAll(".master-toggle-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = btn.getAttribute("data-id");
            const isNowMastered = toggleQuestionMastered(id);
            const card = document.getElementById(`card-${id}`);

            btn.classList.toggle("active", isNowMastered);
            btn.innerHTML = `<i class="${isNowMastered ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'}"></i> <span>${isNowMastered ? 'Mastered' : 'Mark as Mastered'}</span>`;

            if (card) {
                card.classList.toggle("is-mastered", isNowMastered);
            }
        });
    });

    // 3. Analyze Self-Practice Answer Keywords
    document.querySelectorAll(".check-answer-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            const textarea = document.getElementById(`textarea-${id}`);
            const scoreBadge = document.getElementById(`score-${id}`);
            const feedback = document.getElementById(`feedback-${id}`);

            if (!textarea || !scoreBadge || !feedback) return;

            const text = textarea.value.trim().toLowerCase();
            if (!text) {
                feedback.textContent = "Please write a brief explanation first!";
                feedback.style.color = "var(--status-warning)";
                return;
            }

            const q = INTERVIEW_QUESTIONS.find(item => item.id === id);
            if (!q) return;

            const matched = q.keywords.filter(kw => text.includes(kw));
            const ratio = matched.length / q.keywords.length;

            if (ratio >= 0.6) {
                scoreBadge.textContent = "Excellent Coverage (Ready)";
                scoreBadge.style.background = "var(--status-success-bg)";
                scoreBadge.style.color = "var(--status-success)";
                scoreBadge.style.borderColor = "var(--status-success-border)";
                feedback.innerHTML = `<i class="fa-solid fa-circle-check text-success"></i> Great job! You covered key concepts: <strong>${matched.join(", ")}</strong>.`;
                feedback.style.color = "var(--status-success)";
            } else if (ratio >= 0.3) {
                scoreBadge.textContent = "Moderate (Needs Depth)";
                scoreBadge.style.background = "var(--status-warning-bg)";
                scoreBadge.style.color = "var(--status-warning)";
                scoreBadge.style.borderColor = "var(--status-warning-border)";
                feedback.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-amber"></i> Matched: ${matched.join(", ")}. Try mentioning: <em>${q.keywords.filter(k => !matched.includes(k)).slice(0, 3).join(", ")}</em>.`;
                feedback.style.color = "var(--status-warning)";
            } else {
                scoreBadge.textContent = "Incomplete";
                scoreBadge.style.background = "var(--status-danger-bg)";
                scoreBadge.style.color = "var(--status-danger)";
                scoreBadge.style.borderColor = "var(--status-danger-border)";
                feedback.innerHTML = `<i class="fa-solid fa-circle-xmark text-danger"></i> Missing key technical depth. Review the Model Answer and include concepts like: <em>${q.keywords.slice(0, 4).join(", ")}</em>.`;
                feedback.style.color = "var(--status-danger)";
            }
        });
    });
}

// ═══════════════════════════════════════════════════════════════
// Filtering & Search Controller
// ═══════════════════════════════════════════════════════════════
let activeDomain = "all";
let activeCompany = "all";
let activeDifficulty = "all";
let activeSearchQuery = "";

function applyFilters() {
    let filtered = INTERVIEW_QUESTIONS.filter(q => {
        // Domain check
        if (activeDomain !== "all" && q.domain !== activeDomain) return false;

        // Company check
        if (activeCompany !== "all" && q.companyType !== activeCompany) return false;

        // Difficulty check
        if (activeDifficulty !== "all" && q.difficulty !== activeDifficulty) return false;

        // Keyword query check
        if (activeSearchQuery) {
            const query = activeSearchQuery.toLowerCase();
            const inTitle = q.title.toLowerCase().includes(query);
            const inDomain = q.domainLabel.toLowerCase().includes(query);
            const inCompanies = q.companyTags.some(tag => tag.toLowerCase().includes(query));
            const inKeywords = q.keywords.some(kw => kw.toLowerCase().includes(query));
            const inModel = q.modelAnswer.toLowerCase().includes(query);

            if (!inTitle && !inDomain && !inCompanies && !inKeywords && !inModel) {
                return false;
            }
        }

        return true;
    });

    renderInterviewQuestions(filtered);

    // Update count badge
    const countBadge = document.getElementById("filteredCountText");
    if (countBadge) {
        countBadge.textContent = `Showing ${filtered.length} of ${INTERVIEW_QUESTIONS.length} Questions`;
    }
}

function resetAllFilters() {
    activeDomain = "all";
    activeCompany = "all";
    activeDifficulty = "all";
    activeSearchQuery = "";

    const searchInput = document.getElementById("questionSearchInput");
    const clearBtn = document.getElementById("clearSearchBtn");
    const companySelect = document.getElementById("companyTypeSelect");
    const diffSelect = document.getElementById("difficultySelect");

    if (searchInput) searchInput.value = "";
    if (clearBtn) clearBtn.style.display = "none";
    if (companySelect) companySelect.value = "all";
    if (diffSelect) diffSelect.value = "all";

    document.querySelectorAll(".filter-pill").forEach(p => {
        p.classList.toggle("active", p.getAttribute("data-filter") === "all");
    });

    applyFilters();
}

function initInterviewFilters() {
    // Domain Pills
    document.querySelectorAll(".filter-pill").forEach(pill => {
        pill.addEventListener("click", () => {
            document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            activeDomain = pill.getAttribute("data-filter");
            applyFilters();
        });
    });

    // Company Select
    const companySelect = document.getElementById("companyTypeSelect");
    if (companySelect) {
        companySelect.addEventListener("change", (e) => {
            activeCompany = e.target.value;
            applyFilters();
        });
    }

    // Difficulty Select
    const diffSelect = document.getElementById("difficultySelect");
    if (diffSelect) {
        diffSelect.addEventListener("change", (e) => {
            activeDifficulty = e.target.value;
            applyFilters();
        });
    }

    // Instant Search Input
    const searchInput = document.getElementById("questionSearchInput");
    const clearBtn = document.getElementById("clearSearchBtn");

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            activeSearchQuery = e.target.value.trim();
            if (clearBtn) {
                clearBtn.style.display = activeSearchQuery ? "flex" : "none";
            }
            applyFilters();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            activeSearchQuery = "";
            clearBtn.style.display = "none";
            applyFilters();
        });
    }
}

// ═══════════════════════════════════════════════════════════════
// CTC vs In-Hand Salary Reality Calculator
// ═══════════════════════════════════════════════════════════════
function initCtcCalculator() {
    const ctcInput = document.getElementById("ctcInput");
    const ctcRange = document.getElementById("ctcRange");
    const hasEsops = document.getElementById("hasEsops");
    const hasJoining = document.getElementById("hasJoiningBonus");

    if (!ctcInput || !ctcRange) return;

    function formatINR(val) {
        return "₹ " + Math.round(val).toLocaleString("en-IN");
    }

    function calculateCtc() {
        const ctcLakhs = parseFloat(ctcInput.value) || 12;
        const totalAnnualCtc = ctcLakhs * 100000;

        // Realistic breakdown factors in Indian campus placement offers
        let esopDeduction = hasEsops.checked ? totalAnnualCtc * 0.15 : 0;
        let joiningBonusDeduction = hasJoining.checked ? Math.min(200000, totalAnnualCtc * 0.10) : 0;

        // Cash component = CTC minus ESOPs (vested over 4 yrs) minus one-time joining bonus
        const annualGrossSalary = totalAnnualCtc - esopDeduction - joiningBonusDeduction;

        // Base fixed salary is typically 75% to 80% of cash CTC
        const fixedBaseAnnual = annualGrossSalary * 0.80;
        const variableBonusAnnual = annualGrossSalary * 0.20;

        // Provident Fund (PF): 12% of basic (assuming Basic is 50% of Fixed)
        const basicSalary = fixedBaseAnnual * 0.50;
        const annualPf = (basicSalary * 0.12) * 2; // Employer + Employee

        // Professional Tax in India (~₹2,400/yr)
        const profTax = 2400;

        // Estimated New Tax Regime TDS (Rebate up to 7 Lakhs, slabs above)
        let taxableIncome = Math.max(0, annualGrossSalary - 75000); // Standard deduction 75k
        let estimatedAnnualTax = 0;

        if (taxableIncome > 1500000) {
            estimatedAnnualTax = 140000 + (taxableIncome - 1500000) * 0.30;
        } else if (taxableIncome > 1200000) {
            estimatedAnnualTax = 90000 + (taxableIncome - 1200000) * 0.20;
        } else if (taxableIncome > 1000000) {
            estimatedAnnualTax = 60000 + (taxableIncome - 1000000) * 0.15;
        } else if (taxableIncome > 700000) {
            estimatedAnnualTax = 25000 + (taxableIncome - 700000) * 0.10;
        }

        // Net In-Hand Annual
        const annualInHand = Math.max(0, fixedBaseAnnual - (annualPf / 2) - profTax - estimatedAnnualTax);
        const monthlyInHand = annualInHand / 12;

        // Update UI
        const monthlyDisplay = document.getElementById("monthlyInHandDisplay");
        const fixedBaseDisplay = document.getElementById("fixedBaseDisplay");
        const pfDisplay = document.getElementById("pfDeductionDisplay");
        const taxDisplay = document.getElementById("taxDeductionDisplay");
        const bonusDisplay = document.getElementById("bonusDisplay");
        const annualInHandDisplay = document.getElementById("annualInHandDisplay");

        if (monthlyDisplay) monthlyDisplay.textContent = formatINR(monthlyInHand);
        if (fixedBaseDisplay) fixedBaseDisplay.textContent = formatINR(fixedBaseAnnual);
        if (pfDisplay) pfDisplay.textContent = "- " + formatINR(annualPf / 2);
        if (taxDisplay) taxDisplay.textContent = "- " + formatINR(estimatedAnnualTax);
        if (bonusDisplay) bonusDisplay.textContent = formatINR(variableBonusAnnual);
        if (annualInHandDisplay) annualInHandDisplay.textContent = formatINR(annualInHand);
    }

    ctcInput.addEventListener("input", () => {
        ctcRange.value = ctcInput.value;
        calculateCtc();
    });

    ctcRange.addEventListener("input", () => {
        ctcInput.value = ctcRange.value;
        calculateCtc();
    });

    if (hasEsops) hasEsops.addEventListener("change", calculateCtc);
    if (hasJoining) hasJoining.addEventListener("change", calculateCtc);

    // Initial calculation
    calculateCtc();
}

// ═══════════════════════════════════════════════════════════════
// STAR Behavioral Builder Controller
// ═══════════════════════════════════════════════════════════════
const STAR_PRESETS = {
    conflict: {
        situation: "During our 3rd-year capstone project with 4 members, we were building a fullstack web portal with an impending sprint review in 2 weeks. Two team members had a heated disagreement regarding SQL versus MongoDB.",
        task: "As the backend coordinator, I needed to resolve the technical deadlock quickly without alienating anyone and keep our database schema implementation on schedule.",
        action: "I arranged a structured 20-minute meeting where each side presented their requirements. I analyzed our data: relational student transcripts and strict ACID transactions were mandatory. I demonstrated that PostgreSQL supported JSONB columns for flexible profiles while guaranteeing consistency.",
        result: "Both teammates agreed with the objective benchmark. We completed the database layer 3 days ahead of deadline, passed our department review with distinction, and maintained great team chemistry."
    },
    failure: {
        situation: "During an inter-college 24-hour hackathon, our payment integration module crashed during our live product demonstration to the judges.",
        task: "I was the lead developer responsible for handling the API webhook callbacks, and our presentation was scheduled to end in 10 minutes.",
        action: "Instead of panicking, I remained calm, inspected the cloud server logs immediately, and identified that our webhook endpoint lacked an idempotency key, causing duplicate request failures. I pushed a quick hotfix patch and reran the demo transaction successfully.",
        result: "The judges were deeply impressed by how transparently and methodically we debugged the issue under extreme pressure, awarding us 2nd place overall."
    },
    deadline: {
        situation: "In Semester 5, our end-semester practical exams clashed with a major client freelance project milestone.",
        task: "I had to score above 8.5 SGPA while delivering a bug-free REST API backend for the client without missing either deadline.",
        action: "I mapped out my tasks using a strict Eisenhower matrix. I completed mock exam revisions early in the morning and utilized Pomodoro blocks in the evening for coding. I also communicated transparently with the client about our release checkpoints.",
        result: "I scored 8.90 SGPA that semester and successfully delivered the client project with 0 critical bugs, earning a letter of recommendation."
    }
};

function initStarBuilder() {
    const situationEl = document.getElementById("starSituation");
    const taskEl = document.getElementById("starTask");
    const actionEl = document.getElementById("starAction");
    const resultEl = document.getElementById("starResult");
    const compileBtn = document.getElementById("compileStarBtn");
    const copyBtn = document.getElementById("copyStarBtn");
    const outputBox = document.getElementById("starCompiledOutput");
    const outputText = document.getElementById("starCompiledText");

    if (!situationEl || !compileBtn) return;

    // Load default preset (conflict)
    loadStarPreset("conflict");

    document.querySelectorAll(".star-preset-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".star-preset-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const presetKey = btn.getAttribute("data-preset");
            loadStarPreset(presetKey);
        });
    });

    function loadStarPreset(key) {
        const data = STAR_PRESETS[key];
        if (!data) return;
        situationEl.value = data.situation;
        taskEl.value = data.task;
        actionEl.value = data.action;
        resultEl.value = data.result;
        if (outputBox) outputBox.style.display = "none";
        if (copyBtn) copyBtn.style.display = "none";
    }

    compileBtn.addEventListener("click", () => {
        const s = situationEl.value.trim();
        const t = taskEl.value.trim();
        const a = actionEl.value.trim();
        const r = resultEl.value.trim();

        if (!s || !t || !a || !r) {
            alert("Please fill in all four STAR components (Situation, Task, Action, Result) to compile your response!");
            return;
        }

        const compiled = `"${s} Specifically, my responsibility was that ${t.toLowerCase()} To address this, I took action by: ${a} As a result, ${r}"`;

        if (outputText && outputBox) {
            outputText.textContent = compiled;
            outputBox.style.display = "block";
            outputBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }

        if (copyBtn) copyBtn.style.display = "inline-flex";
    });

    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            if (outputText && outputText.textContent) {
                navigator.clipboard.writeText(outputText.textContent).then(() => {
                    const originalHtml = copyBtn.innerHTML;
                    copyBtn.innerHTML = `<i class="fa-solid fa-check text-success"></i> <span>Copied to Clipboard!</span>`;
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHtml;
                    }, 2000);
                }).catch(err => {
                    console.error("Could not copy text: ", err);
                });
            }
        });
    }
}

// ═══════════════════════════════════════════════════════════════
// Initialization Dispatcher
// ═══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
    initInterviewFilters();
    updateMasteredRibbon();
    renderInterviewQuestions(INTERVIEW_QUESTIONS);
    initCtcCalculator();
    initStarBuilder();
});
