from munkres import Munkres
import copy
import heapq
import itertools
import math
from math import inf
DISALLOWED = 999999999999
def reverse_conversion(ms):
        if ms == float('inf'):
            return 'N/A'
        minutes, ms = divmod(ms,60000)
        seconds,ms = divmod(ms,1000)
        return f'{minutes}:{seconds:02}.{ms // 10:02}' if minutes > 0 else f'{seconds}.{ms // 10:02}'
def time_conversion(t):
        if isinstance(t, str):
            if ':' in t:
                minutes,rest = t.split(':')
                seconds, milliseconds = rest.split('.')
                return int(minutes) * 60000 + int(seconds) * 1000 + int(milliseconds) * 10
            else:
                seconds, milliseconds = t.split('.')
                return int(seconds) * 1000 + int(milliseconds) * 10
        elif math.isnan(t):
            return float('inf')
        else:
            raise ValueError(f"Unexpected value type: {t}")
def replace_inf_with_disallowed(matrix):
    return [
        [DISALLOWED if not math.isfinite(cell) else cell for cell in row]
        for row in matrix
    ]
def murty_top_k_assignments(matrix_ms, swimmer_info, stroke_labels, k=5, include_cost=False):
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
        #print("Dummy Job Indices:", dummy_job_indices)
        return padded, dummy_job_indices
    def solve(cost_matrix):
        m = Munkres()
        try:
            indexes = m.compute(cost_matrix)
        except:
            return [], float('inf')
        total_cost = sum(cost_matrix[i][j] for i, j in indexes)
        return indexes, total_cost
    def create_modified_matrix(base_matrix, fixed, forbidden):
        m = [row[:] for row in base_matrix]
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
        clean_matrix = replace_inf_with_disallowed(matrix)
        padded_matrix, dummy_job_indices = pad_cost_matrix(clean_matrix, len(stroke_labels))
        results = []
        seen_assignments = set()
        def is_dummy(j):
            return j in dummy_job_indices
        
        def add_result(assignment, cost):
            key = tuple(sorted((i,j) for i, j in assignment if not is_dummy(j)))
            
            if key not in seen_assignments:
                seen_assignments.add(key)
                results.append((assignment, cost))
                #print("Adding result:", key, "with cost", cost)
                return True
            return False

        best_assignment, best_cost = solve(padded_matrix)
        add_result(best_assignment, best_cost)
        # Priority queue: (cost, fixed, forbidden, assignment)
        queue = []
        
        for i in range(len(best_assignment)):
            swimmer, task = best_assignment[i]
            if is_dummy(task):
                continue
            fixed = [(a, b) for a, b in best_assignment[:i] if not is_dummy(b)]
            forbidden = [best_assignment[i]]
            try:
                new_matrix = create_modified_matrix(padded_matrix, fixed, forbidden)
                alt_assignment, alt_cost = solve(new_matrix)
                heapq.heappush(queue, (alt_cost, fixed, forbidden, alt_assignment))
            except:
                print("skipped")
                continue
              # skip infeasible subproblem

        # Step 2: Expand subproblems
        while len(results) < k and queue:
            cost, fixed, forbidden, assignment = heapq.heappop(queue)
            print("popped",assignment)
            #print("fixed:", fixed, "forbidden:", forbidden, "cost:", cost)
            if not add_result(assignment, cost):
                continue  # Skip duplicates

            # Expand this assignment into more subproblems
            for i in range(len(fixed), len(assignment)):
                # Fix this assignment step
                swimmer, task = assignment[i]
                if is_dummy(task):
                    continue
                new_fixed = fixed + [(swimmer, task)]
                try:
                    mod_matrix = create_modified_matrix(padded_matrix, new_fixed, forbidden)
                    alt_assignment, alt_cost = solve(mod_matrix)
                    heapq.heappush(queue, (alt_cost, new_fixed, forbidden, alt_assignment))
                    #print(mod_matrix)
                except:
                    continue

                # Forbid this assignment step
                new_forbidden = forbidden + [(swimmer, task)]
                try:
                    mod_matrix = create_modified_matrix(padded_matrix, fixed, new_forbidden)
                    alt_assignment, alt_cost = solve(mod_matrix)
                    heapq.heappush(queue, (alt_cost, fixed, new_forbidden, alt_assignment))
                    #print(mod_matrix)
                except:
                    continue
                #input("Press Enter to continue...")

        # Step 3: Format results
        formatted_results = []
        #print ("Results:", results)
        for idx, (assignment, cost) in enumerate(results):
            detailed = []
            for i, j in assignment:
                if is_dummy(j):
                    continue
                name, gender = swimmer_info[i]
                stroke = stroke_labels[j]
                time_ms = matrix[i][j]
                detailed.append([stroke, name, reverse_conversion(time_ms)])
            detailed.sort(key=lambda x: x[0])
            
            if include_cost:
                formatted_results.append((cost,detailed))
            else:
                detailed.append(["Total Time:", reverse_conversion(cost)])
                formatted_results.append(detailed)
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
        if team_info == [('Jack Skerry', 'Open/Male'), ('Jacob Whittle', 'Open/Male'), ('Kaleb Fox-Jones', 'Open/Male'), ('Nathan Holmes', 'Open/Male')]:
            team_results = murty_top_k_assignments(cost_matrix, team_info, stroke_labels, k=5)
            print("Team results:", team_results)
            print("Team info:", team_info)
            print("Cost matrix:", cost_matrix)
            print("Stroke labels:", stroke_labels)
        try:
            team_results = murty_top_k_assignments(cost_matrix, team_info, stroke_labels, k=5, include_cost=True)
        except Exception as e:
            print(f"Error on team {team_info}: {e}")
            continue
        assignments.extend(team_results)

    # Step 4: Sort and select top-K overall
    top_k = sorted(assignments, key=lambda x: x[0])[:k]
    returned_results = []
    for results in top_k:
        result = results[1]  # Exclude cost from final output
        result.append(["Total Time:", reverse_conversion(results[0])])
        returned_results.append(result) # Exclude cost from final output
    return returned_results

print( Munkres().compute([[DISALLOWED, 26380,DISALLOWED,DISALLOWED], [26170,DISALLOWED,DISALLOWED,DISALLOWED], [25490, DISALLOWED, 35580, 28620], [24670, DISALLOWED, DISALLOWED,DISALLOWED]]))
def is_feasible(matrix):
    size = len(matrix)
    # For each row, count how many valid (non-DISALLOWED) entries it has
    row_valid_counts = [sum(1 for cell in row if cell is not DISALLOWED) for row in matrix]
    col_valid_counts = [sum(1 for row in matrix if row[j] is not DISALLOWED) for j in range(size)]

    # If any row or column is entirely DISALLOWED, there's no solution
    return all(count > 0 for count in row_valid_counts) and all(count > 0 for count in col_valid_counts)
print(is_feasible([[DISALLOWED, 26380,DISALLOWED,DISALLOWED], [26170,DISALLOWED,DISALLOWED,DISALLOWED], [25490, DISALLOWED, 35580, 28620], [24670, DISALLOWED, DISALLOWED,DISALLOWED]]))