from munkres import Munkres, DISALLOWED
import copy
import heapq
import itertools
def reverse_conversion(ms):
        if ms == float('inf'):
            return 'N/A'
        minutes, ms = divmod(ms,60000)
        seconds,ms = divmod(ms,1000)
        return f'{minutes}:{seconds:02}.{ms // 10:02}' if minutes > 0 else f'{seconds}.{ms // 10:02}'
    

def murty_top_k_assignments(matrix_ms, swimmer_info, stroke_labels, k=5):
    def pad_cost_matrix(original_matrix, num_strokes, dummy_cost = 0):
        n_rows = len(original_matrix)
        n_cols = num_strokes
        size = max(n_rows, n_cols)

        padded = []
        for row in original_matrix:
            new_row = row[:]
            new_row.extend([dummy_cost] * (size - n_cols))
            padded.append(new_row)
        while len(padded) < size:
            padded.append([dummy_cost] * size)
        dummy_job_indices = list(range(n_cols, size))
        print("Dummy Job Indices:", dummy_job_indices)
        return padded, dummy_job_indices
    def solve(cost_matrix):
        m = Munkres()
        indexes = m.compute(cost_matrix)
        total_cost = sum(cost_matrix[i][j] for i, j in indexes)
        return indexes, total_cost
    def create_modified_matrix(base_matrix, fixed, forbidden):
        m = copy.deepcopy(base_matrix)
        for i, j in forbidden:
            m[i][j] = DISALLOWED
        for i, j in fixed:
            for col in range(len(m[i])):
                if col != j:
                    m[i][col] = DISALLOWED
            for row in range(len(m)):
                if row != i:
                    m[row][j] = DISALLOWED
        return m
    
    def murtys_algorithm(matrix,swimmer_info, stroke_labels, k):
        padded_matrix, dummy_job_indices = pad_cost_matrix(matrix, len(stroke_labels))
        print("Padded Matrix:", padded_matrix)
        results = []
        seen_assignments = set()
        def is_dummy(j):
            return j in dummy_job_indices
        
        def add_result(assignment, cost):
            key = tuple(sorted((i,j) for i, j in assignment if not is_dummy(j)))
            if key not in seen_assignments:
                seen_assignments.add(key)
                results.append((assignment, cost))

        best_assignment, best_cost = solve(padded_matrix)
        add_result(best_assignment, best_cost)
        # Priority queue: (cost, fixed, forbidden, assignment)
        queue = []

        for i in range(len(best_assignment)):
            fixed = best_assignment[:i]
            forbidden = [best_assignment[i]]
            try:
                new_matrix = create_modified_matrix(padded_matrix, fixed, forbidden)
                alt_assignment, alt_cost = solve(new_matrix)
                add_result(alt_assignment, alt_cost)
                heapq.heappush(queue, (alt_cost, fixed, forbidden, alt_assignment))
            except:
                continue  # skip infeasible subproblem

        # Step 2: Expand subproblems
        while len(results) < k and queue:
            cost, fixed, forbidden, assignment = heapq.heappop(queue)

            for i in range(len(fixed), len(assignment)):
                new_fixed = fixed + assignment[len(fixed):i]
                new_forbidden = [assignment[i]]
                try:
                    mod_matrix = create_modified_matrix(matrix_ms, new_fixed, new_forbidden)
                    alt_assignment, alt_cost = solve(mod_matrix)
                    add_result(alt_assignment, alt_cost)
                    heapq.heappush(queue, (alt_cost, new_fixed, new_forbidden, alt_assignment))
                except:
                    continue

        # Step 3: Format results
        formatted_results = []
        print ("Results:", results)
        for idx, (assignment, cost) in enumerate(results):
            detailed = []
            for i, j in assignment:
                if is_dummy(j):
                    continue
                name, gender = swimmer_info[i]
                stroke = stroke_labels[j]
                time_ms = matrix_ms[i][j]
                detailed.append({
                    "swimmer": name,
                    "gender": gender,
                    "stroke": stroke,
                    "time": reverse_conversion(time_ms),
                    "time_ms": time_ms,
                })
            detailed.sort(key=lambda x: x['stroke'])
            formatted_results.append({
                "rank": idx + 1,
                "total_time": reverse_conversion(cost),
                "total_time_ms": cost,
                "assignment": detailed
            })

        return formatted_results
    return murtys_algorithm(matrix_ms, swimmer_info, stroke_labels, k=5)

def murty_gender_partitioned_top_k(matrix_ms, swimmer_info, stroke_labels, k=5):
    assert len(stroke_labels) == 4, "Expected 4 strokes"

    m = Munkres()

    # Step 1: Partition swimmers
    males = [i for i, (_, g) in enumerate(swimmer_info) if g == "Open/Male"]
    females = [i for i, (_, g) in enumerate(swimmer_info) if g == "Female"]
    
    # Step 2: Generate all valid 2M2F combinations
    valid_teams = list(itertools.product(itertools.combinations(males, 2),
                                        itertools.combinations(females, 2)))
    assignments = []

    for male_pair, female_pair in valid_teams:
        team_indices = list(male_pair) + list(female_pair)
        team_info = [swimmer_info[i] for i in team_indices]
        cost_matrix = [matrix_ms[i] for i in team_indices]
    
        assignment = m.compute(cost_matrix)
        total = sum(cost_matrix[i][j] for i, j in assignment)

        formatted = []
        for i, j in assignment:
            swimmer_name, gender = team_info[i]
            stroke = stroke_labels[j]
            time_ms = cost_matrix[i][j]
            formatted.append({
                "swimmer": swimmer_name,
                "gender": gender,
                "stroke": stroke,
                "time": reverse_conversion(time_ms),
                "time_ms": time_ms
            })

        formatted.sort(key=lambda x: x["stroke"])

        assignments.append({
            "team": team_info,
            "assignment": formatted,
            "total_time_ms": total,
            "total_time": reverse_conversion(total)
        })
        

    # Step 3: Sort and return top-k
    top_k = sorted(assignments, key=lambda x: x['total_time_ms'])[:k]
    for rank, item in enumerate(top_k, 1):
        item["rank"] = rank
    return top_k