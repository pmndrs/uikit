# Performance Analysis

Use vitexec artifacts for live-browser slowness, jank, leaks, or network behavior. Logs stay in stdout; artifacts go to disk.

## Choose The Artifact

| Symptom | Capture |
|---|---|
| Expensive JavaScript | `--cpu-profile ./artifacts/cpu.cpuprofile` |
| Failed/slow/large requests | `--network-trace ./artifacts/network.har` |
| Jank, long tasks, rendering cost | `--performance-trace ./artifacts/performance.trace.json` |
| Retained objects/leak | `--heap-snapshot ./artifacts/heap.json` |
| Visual end state | `--screenshot ./artifacts/page.png` |
| Temporal visual issue | `--record ./artifacts/run.webm` |

Capture both `--cpu-profile` and `--performance-trace` when unsure whether the issue is JS or browser rendering. Heap output is vitexec-specific: it is decoded into jq-friendly `nodes`, `edges`, and `summary`.

## First Queries

```sh
jq -r '
  ([.samples[]?] | length) as $total
  | .nodes as $nodes
  | [.samples[]?] | group_by(.) | map({id:.[0], count:length, pct:(length*100/$total)}) | sort_by(-.count)[:30]
  | .[] as $hit
  | ($nodes[] | select(.id==$hit.id)) as $node
  | [($hit.count|tostring), (($hit.pct*10|floor/10)|tostring), ($node.callFrame.functionName // "(anonymous)"), ($node.callFrame.url // ""), (($node.callFrame.lineNumber // -1)+1|tostring)] | @tsv
' ./artifacts/cpu.cpuprofile
```

```sh
jq '.log.entries[]
  | {url:.request.url, method:.request.method, status:.response.status, time:.time, bytes:(.response.bodySize // .response.content.size // 0)}
  | select(.status >= 400 or .time > 1000)
' ./artifacts/network.har
```

```sh
jq -r '
  .traceEvents
  | map(select(.ph=="X" and (.dur // 0) > 1000))
  | group_by(.name)
  | map({name:.[0].name, count:length, totalMs:(map(.dur // 0)|add/1000), maxMs:(map(.dur // 0)|max/1000), cat:(.[0].cat // "")})
  | sort_by(-.totalMs)[:30]
  | .[] | [.totalMs, .maxMs, .count, .name, .cat] | @tsv
' ./artifacts/performance.trace.json
```

```sh
jq '.summary.topConstructorsByCount[0:30]' ./artifacts/heap.json
jq '.nodes[] | select(.name | test("Detached|Leak|Store|Cache|Buffer"))' ./artifacts/heap.json
jq '.edges[] | select(.name | test("payload|listeners|subscribers|cache|store"))' ./artifacts/heap.json
```
