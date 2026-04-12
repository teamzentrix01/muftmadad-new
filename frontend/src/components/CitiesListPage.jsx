function CitiesListPage({ setPage }) {
  return (
    <ListPage
      title="All Cities" entityName="City"
      fetchUrl={`${API}/admin/cities`}
      deleteUrl={`${API}/admin/cities`}
      updateUrl={`${API}/admin/cities`}
      idField="id" addKey="add-city" setPage={setPage}
      editFields={[
        { key: 'name_en', label: 'Name (English)', type: 'text' },
        { key: 'name_hi', label: 'Name (Hindi)', type: 'text' },
        { key: 'slug', label: 'Slug', type: 'text' },
        { key: 'display_order', label: 'Display Order', type: 'number' },
        { key: 'is_active', label: 'Is Active', type: 'checkbox' },
      ]}
      columns={[
        { key: "name_en", label: "Name (EN)" },
        { key: "name_hi", label: "Name (HI)" },
        { key: "slug", label: "Slug" },
        { key: "is_active", label: "Status" },
      ]}
      renderRow={item => (<>
        <td className="py-3 px-5">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-red-500" />
            <span className="font-semibold">{item.name_en}</span>
          </div>
        </td>
        <td className="py-3 px-5 text-sm">{item.name_hi || '—'}</td>
        <td className="py-3 px-5 text-sm font-mono">{item.slug}</td>
        <td className="py-3 px-5"><Badge active={item.is_active} /></td>
      </>)}
    />
  );
}