Potential Issues/Improvements (High Probability for UI Failure):
Authentication:
Supabase Session Issues: The UI now relies on a Supabase session token stored in localStorage. ProtectedRoute checks localStorage for 'supabase_session'. The API service in api.ts retrieves this session token to authenticate requests to the backend. Issues can occur if the token is expired, malformed, or doesn't match what the server expects.
Login Flow: Ensure the Login component successfully receives a valid Supabase session from the API and correctly stores it in localStorage under the key 'supabase_session'.
Supabase Token Handling: The backend's auth.middleware.js now extracts the user from Supabase's auth.getUser() method rather than decoding a custom JWT. Ensure the token being sent from the UI is a valid Supabase token.
API Data Fetching & Structure (usePlans, useNodes):
Inconsistent API Responses: The hooks (usePlans, useNodes) contain logic to handle different response structures (e.g., array vs. paginated object, direct object vs. { data: ... }). This suggests the API might be returning data inconsistently, or the hooks are overly complex. If the API response doesn't match any expected structure, the hooks will return empty data or error out. Use browser Network tab to inspect raw API responses for /plans and /plans/{id}/nodes.
Node Data Flattening: useNodes explicitly flattens the hierarchical data received from the /plans/{id}/nodes endpoint. If the API doesn't return a tree structure, or if the flattening logic is flawed, planNodes will be incorrect.
Mutation Refetching: The use of setTimeout(() => refetch(), 500) in mutations is a code smell. It bypasses React Query's cache invalidation (queryClient.invalidateQueries) likely because it wasn't working as expected. This can lead to stale data or race conditions. Investigate why invalidation wasn't working (e.g., incorrect query keys).
React Flow Visualization (PlanVisualization.tsx):
Data Transformation: transformToFlowNodes and createFlowEdges are critical. If the planNodes array coming from useNodes is empty or malformed, these functions will produce empty/incorrect flowNodes and flowEdges, resulting in an empty React Flow canvas. The extensive debug code added when nodes.length === 0 strongly indicates this is a known problem area.
Layout Algorithm: The current positioning logic in transformToFlowNodes is very basic (x = 200 + (index % 3) * 300; y = 100 + level * 100;). It doesn't create a hierarchical layout and will likely overlap nodes for anything beyond a trivial plan. This will make the visualization unusable. A proper graph layout algorithm (like Dagre or ELK, often integrated via libraries) is needed for automatic positioning.
Custom Nodes: Ensure the nodeTypes mapping (PhaseNode, TaskNode, MilestoneNode) correctly handles all node_type values coming from the API. The default: TaskNode fallback is good, but check if unexpected types are causing issues. Ensure the custom node components correctly receive and render the data.node prop.
Error Handling: While loading states exist, errors from React Query hooks (usePlans, useNodes) might not be prominently displayed, leaving the user with a blank or broken UI without explanation. Display errors clearly.
Dependencies: Check for version compatibility issues between React, React Flow, and other core libraries.
Debugging Steps for the UI

Authentication First:
Generate a Valid Supabase Session: Use the API's /auth/login endpoint (via the UI or Postman) to get a valid Supabase session that includes an access_token.
Verify Token Usage:
Ensure the session is stored correctly in localStorage as 'supabase_session' after login.
In agent-planner-ui/src/services/api.ts, check the Authorization header is being set correctly with the Supabase access token.
Use browser dev tools (Network tab) to inspect the Authorization: Bearer <token> header being sent with API requests.
Check API Auth Logs: Look at the agent-planner/logs/auth.log and api.log for any authentication errors (401, 403) when the UI makes requests.
Inspect API Calls:
Open browser dev tools (Network tab).
Navigate to the /plans list page. Check the response for the /plans request. Is it successful (200)? Does the data structure match what usePlans expects?
Navigate to a specific plan visualization page (/plans/{id}). Check the response for /plans/{id} and /plans/{id}/nodes. Are they successful? What is the exact structure of the /nodes response? Is it an array? Is it nested (hierarchical)?
Debug Data Flow in UI:
Add console.log statements in usePlans and useNodes to see the raw data returned by React Query (data).
In useNodes, log the nodesTree and the result of flattenNodes.
In PlanVisualization.tsx, log planNodes, flowNodes, and flowEdges before they are passed to setNodes and setEdges. Are they populated correctly?
Check the nodes and edges state variables being passed into the <ReactFlow> component itself.
Simplify React Flow:
Temporarily replace the complex transformToFlowNodes positioning logic with simple fixed coordinates (e.g., x: 100, y: index * 100) to see if nodes render at all.
Ensure the custom node components (PhaseNode, etc.) are rendering correctly by adding simple borders or backgrounds. Check for errors within these components.

