```markdown
---
marp: true
theme: neo4j
paginate: true
math: katex
---

### FEG - CMDB: DECLARED VS OBSERVED STATE
##### Enriching Dependencies with Network Telemetry
*AuraDB BC · Serverless Graph Analytics · MCP Server*

---

#### Agenda
1. **Executive Summary** — Bridging declared dependencies with observed network flows.
2. **Target Architecture** — Two-lane system of record and graph analytics.
3. **Proposed Phases** — From schema hardening to dependency reconciliation.
4. **Implementation Notes** — Leveraging serverless analytics and GenAI agents.
5. **Code Snippets** — Starter Cypher patterns for the flow model.
6. **References** — External use cases and internal resources.

---

### Executive Summary

#### Bridging the Gap in Dependency Data
With a strong “Declared State” CMDB graph in Neo4j built from Jira Assets and ticket correlations, the next step is to **enrich declared dependencies with observed network flows** (e.g., Azure NSG Flow Logs). 

**Key Objectives:**
* Detect **shadow IT** and validate **stale/false dependencies**.
* Improve **blast-radius accuracy**.
* Enable **near-real-time risk posture** updates.

#### A Two-Lane Architecture
This proposal recommends separating workloads into a **System-of-Record CMDB Graph (AuraDB BC)** for persistent, queryable data, and **Serverless Graph Analytics** for repeated analytical runs that write back to the CMDB.

---

### Target Architecture

#### System-of-Record vs. Analytics
* **AuraDB (Persistent Graph)**: Hosts the Business Critical CMDB graph, managing governance, tickets, and reconciliation IDs.
* **Graph Analytics**: Uses serverless sessions for algorithms like SPOF detection, PageRank, and community detection, employing a projection and write-back model.
* **GenAI / Assistants**: Aura complements this architecture with **Aura Agents** and an **MCP server for Neo4j**, enabling natural language interaction.

---

### Proposed Phases: A & B

#### Phase A — Stabilise the CMDB (Declared State)
* Confirm canonical **entity IDs** and establish a reconciliation approach using cloud resource IDs, GitHub repo IDs, etc.
* Enforce schema hardening by creating **uniqueness constraints** and operational indexes on stable identifiers.
* Establish boundaries and ownership for the 11 current domain models.

#### Phase B — Add Observed State (Flow layer)
* Ingest **NSG Flow Logs** to create a flow model connecting IPs: `(:IP)-[:FLOW]->(:IP)`.
* Fold these flows into higher-level identities such as Workload, Service, App, and Subnet.
* Build **confidence scoring** for observed edges based on frequency, volume, and recency.

---

### Proposed Phases: C & D

#### Phase C — Reconcile Dependencies
Produce "diff views" to compare declared versus observed states:
* **Declared-only edges** (highlighting possibly stale data).
* **Observed-only edges** (highlighting shadow IT).
* **Confirmed edges** (found in both).
* Feed these insights back to improve blast-radius traversal and incident ticket enrichment.

#### Phase D — Analytics & Operationalization
* Run GDS algorithms for **SPOF patterns, criticality ranking, and dependency hotspots**.
* Detect "interaction neighborhoods" using community detection.
* Write results back to the CMDB for dashboards and expose them optionally via MCP or Agent tools.

---

### Implementation Notes Aligned to Aura

#### Serverless Graph Analytics
Neo4j positions **Aura Graph Analytics** as a serverless option running on an on-demand consumption model. 
Use this for elastic analytics without a full-time DS instance, allowing concurrency for multiple analysts and repeated projection/write-back.

#### MCP and Aura Agents
Aura’s GenAI roadmap highlights the **MCP Server for Neo4j** and **Aura Agents** for CMDB query and automation. 
**Key Use Cases:**
* "Ask the CMDB" converting natural language to Cypher with guardrails.
* "Explain blast radius" to produce evidence paths.
* Compile change impact briefings detailing impacted services and recent incidents.

---

### Starter Code Snippets

#### 1. Flow Layer Model (Observed Edges)
Merge IPs and aggregate flow metrics over time windows.
```cypher
MERGE (src:IP {value:$srcIp})
MERGE (dst:IP {value:$dstIp})
MERGE (src)-[f:FLOW {windowStart:$windowStart, windowEnd:$windowEnd}]->(dst)
SET f.bytes = coalesce(f.bytes,0) + $bytes, f.action = $action;
```

#### 2. Reconcile Observed to Workload Identity
Link IPs back to host/service workloads via NIC mappings.
```cypher
MATCH (ip:IP {value:$ip})
MATCH (nic:NIC {resourceId:$nicId})-[:ATTACHED_TO]->(wl:Workload)
MERGE (wl)-[:HAS_IP]->(ip);
```

---

### GDS Workflow & References

#### Projection and Write-Back Pattern
Project the graph using elements like `Workload`, `Service`, and `FLOW` using the `gds.graph.project` procedure to prepare for analytical computation.

#### References
* CBA network observability knowledge graph use case.
* Neo4j's GenAI / GraphRAG ecosystem roadmap and best practices deck covering Aura Agents and the MCP server.
* Internal Slack discussions and channels for the proposed workflows.
```
