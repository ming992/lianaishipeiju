(function(){
function make(draft){const duo=draft.mode==='duo';const analysis=LoveScore.analyze(draft.answers[0],duo?draft.answers[1]:null,draft.ids);const matches=analysis.dimensions.flatMap(d=>d.evidence.filter(e=>e.similarity===100).map(e=>({...e,dimension:d.name}))).slice(0,3);const differences=analysis.dimensions.filter(d=>d.similarity!==null&&d.similarity<80).sort((a,b)=>a.similarity-b.similarity);const order=[...differences,...analysis.dimensions.filter(d=>!differences.some(x=>x.id===d.id))];const plan=Array.from({length:7},(_,i)=>({day:i+1,dimension:order[i].name,task:order[i].practice,reason:duo?`根据「${order[i].name}」的${order[i].similarity<80?'回答差异':'共同探索主题'}安排。`:`根据你回答的「${order[i].name}」安排。`}));
return {id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),created:new Date().toISOString(),mode:draft.mode,version:draft.version,stage:draft.stage,names:draft.names,answers:draft.answers,ids:draft.ids,analysis,matches,differences,plan,title:duo?LoveScore.tier(analysis.index):analysis.profileA.name,summary:duo?(differences.length?'你们有不同的表达，也有值得一起找到的节奏。':'相似的答案，是继续了解彼此的一个温柔起点。'):'懂得自己想要什么，也是靠近一段舒服关系的开始。'};}
function qualityText(q){const notes=[`已答 ${q.answered}/${q.total} 题，覆盖 ${q.coverage}/10 个维度。`];if(q.total<=12)notes.push('速测样本较少，只能提供初步探索。');if(q.scaleCount&&q.neutral/q.scaleCount>=.5)notes.push(`量表题中 ${q.neutral}/${q.scaleCount} 为中立回答，暂时不确定也很正常，解读应更谨慎。`);if(q.inconsistent.length)notes.push(`有 ${q.inconsistent.length} 组相关回答方向相距较大，可能来自情境差异，建议复看。`);if(q.answered<q.total)notes.push('存在缺失答案；未作答内容不纳入计分。');return notes.join(' ');}
function expression(answers,dimension){const messages={
communication:['我现在想被认真听见，先听我把感受说完，再一起想办法，好吗？','我现在需要一点独处时间，不是不在乎你。我们约一个时间再认真聊，好吗？','如果你也愿意，一个拥抱或安静陪伴会让我觉得被接住。','我想先一起做一点轻松的事，放松后再说说发生了什么。'],
trust:['对我来说，说到做到很重要。做不到时提前告诉我，我们可以重新商量。','适当地分享近况会让我安心。我们找一个双方都舒服的联系频率吧。','我愿意信任你，也希望我们的隐私和个人空间得到尊重。','困难时知道你愿意在场，会让我安心。你能先问问我需要什么吗？'],
conflict:['我希望及时讲清楚，也会注意语气。如果你需要暂停，我们约好回来谈的时间。','我需要先缓一缓，想和你约个明确时间回来继续聊，而不是把问题放着。','我现在更需要先被安抚。等情绪稳定下来，我愿意一起找解决办法。','我想先写下自己的想法，也认真看看你的想法，再一起讨论。'],
affection:['明确说出喜欢和欣赏，会让我更容易感到你的爱意。','专心陪伴的时间对我很重要，我们安排一小段不分心的相处吧。','当你帮我处理一件实际的小事时，我会感到被关心。','双方都愿意的拥抱和亲近，会让我感觉温暖；不愿意时我们也可以直接说。'],
rhythm:['这个周末我更想在家恢复精力，也想听听你想怎么安排。','我想出门探索一个新地方，我们选一个彼此都舒服的时间吧。','我这次想和朋友聚聚，也想安排一段属于我们的相处时间。','我想给周末留一点弹性，我们确认一段共同时间，其余按状态安排。'],
money:['我希望先约定预算上限，这会让我更放松地享受约会。','我会重视体验，也愿意先听听你的预算范围，再找双方舒服的方案。','我这次更偏好低预算安排，和你相处的体验对我很重要。','我希望保留各自预算的自主权，共同花费前我们单独商量。'],
future:['我目前更重视职业成长，想与你讨论怎样兼顾关系与各自目标。','我目前很重视关系的稳定，想听听我们愿意共同做哪些具体安排。','我想给探索生活留一点空间，也愿意听听你当前最重视的目标。','我暂时希望保留弹性，我们可以先确认近期计划，再逐步讨论长期安排。'],
support:['压力大时，我更需要先被听见。可以先听我说完，再问我想不想听建议吗？','我现在想一起寻找办法，你愿意和我讨论一个可以先做的小步骤吗？','如果你能帮我处理一件具体的小事，会让我觉得压力小一点。','我现在更希望安静陪着，不一定需要说很多话。'],
boundaries:['一起度过较多时间会让我舒服，也想确认你需要保留多少个人空间。','我希望共同相处和独处都有清楚的安排，我们一起选一个舒服的比例吧。','我需要比较多的自主时间，这不减少我的在意。我们约好专心相处的时段吧。','我希望按当周状态商量相处与独处的安排，变化时会及时告诉你。'],
expectations:['我最期待稳定陪伴。我们可以约定一个双方都能做到的小习惯吗？','我重视共同成长，也希望知道怎样支持你自己的目标。','我期待一些浪漫体验，我们轮流安排一个彼此喜欢的小惊喜吧。','理解和自由对我很重要。我们可以说清楚期待，也给不同选择留空间。']};const choice=answers[dimension+'_1'];return messages[dimension]?.[Number(choice)]||LoveData.dimensions.find(d=>d.id===dimension).translation;}
window.LoveReports={make,qualityText,expression};
})();
