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
        
    best_teams = murtys_algorithm(matrix_ms, swimmer_info, stroke_labels, k=5)
    return best_teams
    best_team,cost = solve(matrix_ms)
    remove_swimmers = [i for i, _ in best_team]
    swimmer_info = [n for idx, n in enumerate(swimmer_info) if idx not in remove_swimmers]
    matrix_ms = [row for idx, row in enumerate(matrix_ms) if idx not in remove_swimmers]
    b_team,cost = solve(matrix_ms)
    results = []
    for i, j in b_team:
        name = swimmer_info[i][0]
        stroke = stroke_labels[j]
        time_ms = matrix_ms[i][j]
        results.append([stroke, name, reverse_conversion(time_ms)])
    results.sort(key=lambda x: x[0])
    #results.append(["Total Time:", reverse_conversion(cost)])
    #best_teams.append(results)
    #print("Best Teams:", best_teams)
    return best_teams


def murty_gender_partitioned_top_k(matrix_ms, swimmer_info, stroke_labels, k=5):
    assert len(stroke_labels) == 4, "Expected 4 strokes"

    m = Munkres()

    # Step 1: Partition swimmers
    males = [i for i, (_, g) in enumerate(swimmer_info) if g == "Open/Male"]
    females = [i for i, (_, g) in enumerate(swimmer_info) if g == "Female"]
    
    # Step 2: Generate all valid 2M2F combinations
    valid_teams = list(itertools.product(itertools.combinations(males, 2),
                                        itertools.combinations(females, 2)))
    def solve(cost_matrix):
        fallback_cost = 99999999  # Arbitrarily large cost to discourage selection

        # Replace any inf values with a finite fallback
        clean_matrix = [
            [fallback_cost if val == float('inf') else val for val in row]
            for row in cost_matrix
        ]

        m = Munkres()
        try:
            indexes = m.compute(clean_matrix)
        except:
            return [], float('inf')
        total_cost = sum(clean_matrix[i][j] for i, j in indexes)
        return indexes, total_cost
    print(len(valid_teams), "valid teams found")
    assignments = []
    counter = 0
    for male_pair, female_pair in valid_teams:
        team_indices = list(male_pair) + list(female_pair)
        team_info = [swimmer_info[i] for i in team_indices]
        cost_matrix = [matrix_ms[i] for i in team_indices]
        try:
            indexes,total_cost = solve(cost_matrix)
        except Exception as e:
            print(f"Error on team {team_info}: {e}")
            continue
        assignment = []
        assignments.append((total_cost, team_indices, team_info, cost_matrix))
        counter +=1
        if counter % 1000 == 0:
            print(f"Processed {counter} teams")
        




    # Step 4: Sort and select top-K overall
    top_assignments = sorted(assignments, key=lambda x: x[0])[:k]
    refined_results = []
    for total_cost, team_indices,team_info, cost_matrix in top_assignments:
        try:
            murty_results = murty_top_k_assignments(cost_matrix, team_info, stroke_labels, k=5, include_cost=True)
            print(murty_results)
        except Exception as e:
            print(f"Murty failed on team {team_info}: {e}")
            continue

        for result in murty_results:
            print("Result:", result)
            cost = result[0]
            assignment = result[1]
            assignment.append(["Total Time:", reverse_conversion(cost)])
            refined_results.append((cost, assignment))


    final_top_5 = sorted(refined_results, key=lambda x: x[0])[:k]
    returned_results = [assignment for _, assignment in final_top_5]

    print("Returned Results:", returned_results)
    return returned_results


    excluded_swimmers = {entry[1] for entry in fastest}
    b_team = [item for item in sorted_teams if not excluded_swimmers.intersection({entry[1]for entry in item[1]})]
    if b_team:
        result = b_team[0][1]
        result.append(["Total Time:", reverse_conversion(b_team[0][0])])
        returned_results.append(result)
    print("Returned Results:", returned_results)
    return returned_results

def b_team(matrix_ms, swimmer_info, stroke_labels, k=5):
    def solve(cost_matrix):
        m = Munkres()
        try:
            indexes = m.compute(cost_matrix)
        except:
            return [], float('inf')
        return indexes
    best_team = solve(matrix_ms)
    remove_swimmers = [i for i, _ in best_team]
    swimmer_info = [n for idx, n in enumerate(swimmer_info) if idx not in remove_swimmers]
    matrix_ms = [row for idx, row in enumerate(matrix_ms) if idx not in remove_swimmers]
    # print("Best team:", best_team)
    # print("Swimmer info:", swimmer_info)
    # print("Stroke labels:", stroke_labels)
    # print("Matrix MS:", matrix_ms)
    b_team = solve(matrix_ms)
    #print("B team:", b_team)
    results = []
    for i, j in b_team:
        name = swimmer_info[i][0]
        stroke = stroke_labels[j]
        time_ms = matrix_ms[i][j]
        results.append([stroke, name, reverse_conversion(time_ms)])
        results.sort(key=lambda x: x[0])
        results.append(["Total Time:", reverse_conversion(sum(matrix_ms[i][j] for i, j in b_team))])
    #print("B team results:", results)
    return results

