import { useEffect, useRef, useState, type FormEvent } from 'react'
import { adjustStock, getProducts, saveProduct } from '../api/products'
import { ApiError } from '../api/http'
import type { Product } from '../types/product'
import { currencyInputToNumber, formatCurrency, formatCurrencyInput } from '../utils/formatters'
import { markupFromPrice, priceFromMarkup } from '../utils/productPricing'

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Não foi possível concluir a operação. Tente novamente.'
}

export function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [barcode, setBarcode] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('0')
  const [cost, setCost] = useState('')
  const [markup, setMarkup] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [pricingSource, setPricingSource] = useState<'markup' | 'price'>('markup')
  const [adjusting, setAdjusting] = useState<Product | null>(null)
  const [adjustment, setAdjustment] = useState('')
  const [reason, setReason] = useState('')
  const [adjustError, setAdjustError] = useState<string | null>(null)
  const barcodeInput = useRef<HTMLInputElement>(null)
  const adjustmentInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    getProducts(controller.signal).then(setProducts).catch((e: unknown) => {
      if (!controller.signal.aborted) setListError(errorMessage(e))
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [])

  async function refresh() {
    setLoading(true)
    setListError(null)
    try { setProducts(await getProducts()) } catch (e) { setListError(errorMessage(e)) }
    finally { setLoading(false) }
  }

  function replace(product: Product) {
    setProducts((current) => [...current.filter((p) => p.id !== product.id), product]
      .sort((a, b) => a.descricao.localeCompare(b.descricao, 'pt-BR')))
  }

  function reset() {
    setEditing(null); setBarcode(''); setDescription(''); setQuantity('0'); setCost(''); setMarkup(''); setError(null)
    setSalePrice(''); setPricingSource('markup')
  }

  function edit(product: Product) {
    setEditing(product); setBarcode(product.codigo_barras); setDescription(product.descricao)
    setCost(formatCurrencyInput(String(Math.round((product.valor_custo ?? 0) * 100))))
    setMarkup(String(product.percentual ?? 0)); setError(null)
    setSalePrice(formatCurrencyInput(String(Math.round(product.valor_venda * 100))))
    setPricingSource('price')
    barcodeInput.current?.focus()
  }

  const costValue = currencyInputToNumber(cost)
  const displayedMarkup = pricingSource === 'price' ? markupFromPrice(cost, salePrice) : markup
  const displayedPrice = pricingSource === 'markup' ? priceFromMarkup(cost, markup) : salePrice
  const markupValue = Number(displayedMarkup.replace(',', '.'))
  const price = currencyInputToNumber(displayedPrice)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setError(null); setNotice(null)
    if (!barcode.trim() || /\s/.test(barcode.trim()) || !description.trim() || costValue <= 0 || !/^\d+([.,]\d{1,2})?$/.test(displayedMarkup) || markupValue > 10000 || price < costValue || price > 9999999999.99 || (!editing && (!Number.isInteger(Number(quantity)) || Number(quantity) < 0 || Number(quantity) > 1000000000))) {
      setError('Revise o código, a descrição, o custo, o percentual e a quantidade.'); return
    }
    setSaving(true)
    try {
      const product = await saveProduct({
        codigo_barras: barcode.trim(), descricao: description.trim(), valor_custo: costValue,
        ...(pricingSource === 'price' ? { valor_venda: price } : { percentual: markupValue }),
        ...(!editing ? { quantidade_estoque: Number(quantity) } : {}),
      }, editing?.id)
      replace(product); reset(); setNotice(editing ? 'Produto atualizado.' : 'Produto cadastrado.')
    } catch (e) { setError(errorMessage(e)) } finally { setSaving(false) }
  }

  async function submitAdjustment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!adjusting || saving) return
    setAdjustError(null); setNotice(null)
    const value = Number(adjustment)
    if (!Number.isInteger(value) || value === 0 || Math.abs(value) > 1000000000 || !reason.trim()) {
      setAdjustError('Informe uma quantidade inteira diferente de zero e o motivo.'); return
    }
    setSaving(true)
    try {
      replace(await adjustStock(adjusting.id, value, reason.trim()))
      setAdjusting(null); setAdjustment(''); setReason(''); setNotice('Estoque ajustado com sucesso.')
    } catch (e) { setAdjustError(errorMessage(e)) } finally { setSaving(false) }
  }

  const filtered = products.filter((p) => p.codigo_barras.includes(search.trim()) || p.descricao.toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR')))

  return <section className="inventory-page">
    <div className="page-intro employees-intro">
      <div><p className="eyebrow">Produtos e disponibilidade</p><h2>Estoque</h2><p>Cadastre produtos, defina os preços e acompanhe as quantidades.</p></div>
      <span className="owner-only-badge">Acesso do empresário</span>
    </div>
    {notice && <div className="success-notice" role="status">{notice}<button type="button" aria-label="Fechar mensagem" onClick={() => setNotice(null)}>×</button></div>}
    <div className="sales-create-layout">
      <section className="sales-form-card">
        <div className="sales-card-header"><h3>{editing ? 'Editar produto' : 'Novo produto'}</h3></div>
        <form className="sales-form" onSubmit={submit}>
          <div className="sales-form-grid">
            <div className="form-field"><label htmlFor="product-barcode">Código de barras</label><input id="product-barcode" ref={barcodeInput} value={barcode} maxLength={128} autoComplete="off" required disabled={saving} onChange={(e) => setBarcode(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('product-description')?.focus() } }} /></div>
            <div className="form-field"><label htmlFor="product-description">Descrição do produto</label><input id="product-description" value={description} maxLength={255} required disabled={saving} onChange={(e) => setDescription(e.target.value)} /></div>
            {!editing && <div className="form-field"><label htmlFor="product-quantity">Quantidade inicial em estoque</label><input id="product-quantity" type="number" min="0" max="1000000000" step="1" value={quantity} required disabled={saving} onChange={(e) => setQuantity(e.target.value)} /></div>}
            <div className="form-field"><label htmlFor="product-cost">Custo por unidade (R$)</label><input id="product-cost" inputMode="numeric" value={cost} placeholder="0,00" required disabled={saving} onChange={(e) => setCost(formatCurrencyInput(e.target.value))} /></div>
            <div className="form-field"><label htmlFor="product-markup">Acréscimo sobre o custo (%)</label><input id="product-markup" inputMode="decimal" value={displayedMarkup} placeholder="Ex.: 30" required={pricingSource === 'markup'} disabled={saving} onChange={(e) => { setMarkup(e.target.value); setPricingSource('markup') }} /><span className="field-help">Ao informar o percentual, o valor final é calculado automaticamente.</span></div>
            <div className="form-field"><label htmlFor="product-price">Valor final de venda (R$)</label><input id="product-price" inputMode="numeric" value={displayedPrice} placeholder="0,00" required={pricingSource === 'price'} disabled={saving} onChange={(e) => { setSalePrice(formatCurrencyInput(e.target.value)); setPricingSource('price') }} /><span className="field-help">Ao informar o valor final, o percentual é calculado automaticamente.</span>{pricingSource === 'price' && salePrice && costValue > 0 && price < costValue && <span className="form-error">O valor de venda não pode ser menor que o custo.</span>}</div>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="inventory-actions"><button className="submit-button" disabled={saving} type="submit">{saving ? 'Salvando...' : editing ? 'Salvar produto' : 'Cadastrar produto'}</button>{editing && <button className="retry-button" disabled={saving} type="button" onClick={reset}>Cancelar edição</button>}</div>
        </form>
      </section>
      <aside className="sale-summary-card">
        <span className="sale-summary-index" aria-hidden="true">
          ES
        </span>
        <p className="eyebrow">Resumo do produto</p>
        <h3>Valor final de venda</h3>
        <strong className="sale-summary-total" aria-live="polite">
          {formatCurrency(price)}
        </strong>
        <dl>
          <div>
            <dt>Custo por unidade</dt>
            <dd>{formatCurrency(costValue)}</dd>
          </div>
          <div>
            <dt>Acréscimo</dt>
            <dd>{displayedMarkup ? displayedMarkup + '%' : 'Não informado'}</dd>
          </div>
          <div>
            <dt>{editing ? 'Estoque atual' : 'Estoque inicial'}</dt>
            <dd>
              {editing
                ? (products.find((product) => product.id === editing.id)?.quantidade_estoque ?? editing.quantidade_estoque)
                : quantity || '0'}
            </dd>
          </div>
        </dl>
        <p className="sale-summary-note">
          {editing
            ? 'O preço será atualizado para as próximas vendas. O estoque é alterado pela venda ou por um ajuste.'
            : 'O valor final será preenchido automaticamente nas vendas deste produto.'}
        </p>
      </aside>
    </div>
    {adjusting && <section className="sales-form-card inventory-adjustment">
      <div className="sales-card-header"><h3>Ajustar estoque: {adjusting.descricao}</h3></div>
      <form className="sales-form" onSubmit={submitAdjustment}><p>Saldo consultado: {adjusting.quantidade_estoque} unidades. O ajuste será aplicado ao saldo atual.</p><div className="sales-form-grid">
        <div className="form-field"><label htmlFor="stock-adjustment">Quantidade de entrada ou saída</label><input id="stock-adjustment" ref={adjustmentInput} type="number" step="1" min="-1000000000" max="1000000000" value={adjustment} required disabled={saving} onChange={(e) => setAdjustment(e.target.value)} /><span className="field-help">Ex.: 10 para entrada ou -2 para saída.</span></div>
        <div className="form-field"><label htmlFor="stock-reason">Motivo</label><input id="stock-reason" value={reason} maxLength={255} required disabled={saving} onChange={(e) => setReason(e.target.value)} placeholder="Ex.: reposição de mercadoria" /></div>
      </div>{adjustError && <p className="form-error" role="alert">{adjustError}</p>}<div className="inventory-actions"><button className="submit-button" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Confirmar ajuste'}</button><button className="retry-button" type="button" disabled={saving} onClick={() => setAdjusting(null)}>Cancelar</button></div></form>
    </section>}
    <section className="sales-list-card">
      <div className="sales-list-header"><div><h3>Produtos cadastrados</h3><p>{products.length === 1 ? '1 produto' : products.length + ' produtos'}</p></div><button type="button" className="retry-button" disabled={loading || saving} onClick={() => void refresh()}>Atualizar</button></div>
      <div className="form-field inventory-search"><label htmlFor="inventory-search">Buscar por descrição ou código de barras</label><input id="inventory-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      {loading ? <div className="customers-state" role="status">Carregando estoque...</div> : listError ? <div className="customers-state" role="alert"><p>{listError}</p><button className="retry-button" type="button" onClick={() => void refresh()}>Tentar novamente</button></div> : filtered.length === 0 ? <div className="customers-state">{products.length ? 'Nenhum produto encontrado.' : 'Cadastre o primeiro produto no formulário acima.'}</div> : <div className="inventory-table-wrap"><table className="inventory-table"><thead><tr><th>Produto</th><th>Estoque</th><th>Custo</th><th>Acréscimo</th><th>Venda</th><th>Ações</th></tr></thead><tbody>{filtered.map((p) => <tr key={p.id}>
        <td data-label="Produto"><strong>{p.descricao}</strong><small>{p.codigo_barras}</small></td><td data-label="Estoque"><span className={p.quantidade_estoque === 0 ? 'inventory-empty' : ''}>{p.quantidade_estoque}{p.quantidade_estoque === 0 ? ' · Esgotado' : ''}</span></td><td data-label="Custo">{formatCurrency(p.valor_custo ?? 0)}</td><td data-label="Acréscimo">{p.percentual}%</td><td data-label="Venda">{formatCurrency(p.valor_venda)}</td><td data-label="Ações"><div className="inventory-table-actions"><button className="inventory-action-button" type="button" disabled={saving} onClick={() => edit(p)}>Editar</button><button className="inventory-action-button is-secondary" type="button" disabled={saving} onClick={() => { setAdjusting(p); setAdjustment(''); setReason(''); setAdjustError(null); setTimeout(() => adjustmentInput.current?.focus(), 0) }}>Ajustar estoque</button></div></td>
      </tr>)}</tbody></table></div>}
    </section>
  </section>
}
