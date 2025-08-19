import { API_BASE } from "./config.js";
export async function runPython(
  swimmer_array,
  course,
  poolLength,
  targetGender
) {
  const sentData = {
    array: swimmer_array,
    courseType: course,
    pool_length: poolLength,
    target_gender: targetGender,
  };
  const response = await fetch(`${API_BASE}/run-function/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sentData),
  });

  if (response.ok) {
    const data = await response.json();
    return data.result;
  } else {
    console.error("Error:", response.statusText);
    return null;
  }
}
