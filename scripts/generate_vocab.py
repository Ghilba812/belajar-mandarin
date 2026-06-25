import json
import pathlib

src = pathlib.Path(r"c:\Users\gobyr\Downloads\MandarinPinyinArti.txt")
text = src.read_text(encoding='utf-8')
lines = [line.rstrip('\n') for line in text.splitlines()]
rows = []
for line in lines:
    if not line.strip():
        continue
    if line.startswith('|'):
        parts = [p.strip() for p in line.strip('|').split('|')]
        if len(parts) >= 3 and parts[0] not in {'Mandarin', '--------'}:
            rows.append(parts[:3])

seen = set()
items = []
for hanzi, pinyin, arti in rows:
    key = (hanzi, pinyin)
    if key in seen:
        continue
    seen.add(key)
    items.append((hanzi, pinyin, arti))

mid = len(items) // 2
feiza_items = items[:mid]
ghilba_items = items[mid:]


def infer_category(hanzi, indonesian):
    text = f"{hanzi} {indonesian}".lower()
    if any(k in hanzi or k in indonesian for k in ['采购', '供应商', '询价', '议价', '比价', '报价', '合同', '审批', '订单', '付款', '税', '关税', '汇率', '商务', '谈判', '成本', '利润', '采购申请', '采购负责人']):
        return 'Purchasing'
    if any(k in hanzi or k in indonesian for k in ['供应商', '供应链', '供应']):
        return 'Supplier'
    if any(k in hanzi or k in indonesian for k in ['合同', '协议', '审批', '签字', '盖章']):
        return 'Contract'
    if any(k in hanzi or k in indonesian for k in ['税', '费用', '成本', '利润', '价', '汇率', '关税', '保险', '运费']):
        return 'Finance'
    if any(k in hanzi or k in indonesian for k in ['仓', '库', '库存', '仓储', '收货', '入库', '发货', '物流', '配送', '运输']):
        return 'Warehouse'
    if any(k in hanzi or k in indonesian for k in ['库存', '储量', '消耗', '安全库存', '存货', '盘点']):
        return 'Inventory'
    if any(k in hanzi or k in indonesian for k in ['气', '燃', '油', '汽油', '柴油', '液化', '丙烷', '标准气', '油罐']):
        return 'Gas'
    if any(k in hanzi or k in indonesian for k in ['混凝土', '砖', '玻璃', '吊顶', '石', '砂', '木方', '沥青', '外加剂', '建材', '装修', '油漆', '胶水', '卫浴', '大理石', '瓷砖']):
        return 'Construction'
    if any(k in hanzi or k in indonesian for k in ['设备', '机械', '电梯', '空调', '除湿', '电缆', '消防', '工具', '设备', '机']):
        return 'Equipment'
    if any(k in hanzi or k in indonesian for k in ['物流', '运输', '海运', '空运', '陆运', '集装箱', '包机', '装船']):
        return 'Logistics'
    if any(k in hanzi or k in indonesian for k in ['行政', '办公', '科室', '分组', '执行', '管理', '登记']):
        return 'Administration'
    if any(k in hanzi or k in indonesian for k in ['员工', '人员', '职能', '培训', '招聘', '劳保']):
        return 'Human Resource'
    if any(k in hanzi or k in indonesian for k in ['安全', '消防', '防火', '防盗', '环保', '排水', '维保', '安装']):
        return 'Safety'
    return 'General'


def infer_level(hanzi, indonesian):
    text = f"{hanzi} {indonesian}".lower()
    if any(k in hanzi or k in indonesian for k in ['术语', '通则', '国际', '评价', '评估', '审批', '协议', '委托', '标准', '管理', '流程', '合同', '供应链', '贸易', '税务', '海关', '汇率', '风险', '成本分析', '规范']):
        return 'Advanced'
    if len(hanzi) > 4 or any(k in hanzi or k in indonesian for k in ['负责人', '物流', '供应商', '采购', '审批', '合同', '仓储', '运输', '评价', '评估', '评审', '设备', '安装']):
        return 'Intermediate'
    return 'Beginner'


def build_items(items):
    result = []
    for idx, (hanzi, pinyin, arti) in enumerate(items, start=1):
        result.append({
            'id': idx,
            'hanzi': hanzi,
            'pinyin': pinyin,
            'indonesian': arti,
            'category': infer_category(hanzi, arti),
            'level': infer_level(hanzi, arti),
            'favorite': False,
            'mastered': False,
        })
    return result

out_dir = pathlib.Path('src/data/users')
out_dir.mkdir(parents=True, exist_ok=True)
(out_dir / 'feiza.json').write_text(json.dumps(build_items(feiza_items), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(out_dir / 'ghilba.json').write_text(json.dumps(build_items(ghilba_items), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('feiza', len(feiza_items))
print('ghilba', len(ghilba_items))
