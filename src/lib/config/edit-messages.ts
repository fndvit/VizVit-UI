/**
 * The editor chrome's own strings — status announcements, panel labels, the
 * confirm-delete wording. A separate object from `UiMessages` on purpose:
 * that interface mirrors the website's wording catalog (its keys are
 * `ui_messages` rows a CMS edits), while these strings belong to the EDITOR
 * a CMS host renders — they must never leak into the site's catalog, and
 * they must never themselves become editable chrome.
 *
 * Same message-function style as `UiMessages`, and the same all-or-nothing
 * override: a host replaces the whole object or keeps the Catalan defaults.
 */
export interface EditMessages {
	/** Inline + panel status announcements. */
	edit_saving(): string;
	edit_saved(): string;
	edit_saveError(): string;
	/** RichText's source editor. */
	edit_save(): string;
	edit_cancel(): string;
	edit_edit(): string;
	edit_preview(): string;
	edit_editBody(): string;
	/** The frame toolbar and its panel. */
	edit_properties(params: { label: string }): string;
	edit_remove(): string;
	edit_removeConfirm(params: { label: string }): string;
	edit_close(): string;
	/** Collections. */
	edit_add(params: { label: string }): string;
	edit_addFailed(): string;
	/** Property rows. */
	edit_uploadImage(): string;
	edit_clearValue(): string;
	edit_emptyRequired(): string;
}

/**
 * Catalan defaults. The first three and the RichText strings reproduce the
 * previously hardcoded copy byte-identically — swapping the source of a
 * string must not repaint a single test or page.
 */
export const defaultEditMessages: EditMessages = {
	edit_saving: () => 'Desant…',
	edit_saved: () => 'Desat',
	edit_saveError: () => 'Error en desar',
	edit_save: () => 'Desa',
	edit_cancel: () => 'Cancel·la',
	edit_edit: () => 'Edita',
	edit_preview: () => 'Vista prèvia',
	edit_editBody: () => 'Edita el contingut',
	edit_properties: ({ label }) => `Propietats: ${label}`,
	edit_remove: () => 'Elimina',
	edit_removeConfirm: ({ label }) =>
		`Segur que vols eliminar «${label}»? Es pot desfer des de l’historial.`,
	edit_close: () => 'Tanca',
	edit_add: ({ label }) => `Afegeix ${label}`,
	edit_addFailed: () => 'No s’ha pogut afegir',
	edit_uploadImage: () => 'Puja una imatge',
	edit_clearValue: () => 'Buida el valor',
	edit_emptyRequired: () => 'Aquest camp no pot quedar buit'
};
