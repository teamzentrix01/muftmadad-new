-- Initial cities already listed in the site's footer.
-- Preserve existing city settings when this seed is run again.
BEGIN;

INSERT INTO public.cities (name_en, name_hi, slug, display_order, is_active)
VALUES
    ('Moradabad', 'मुरादाबाद', 'moradabad', 1, true),
    ('Chandausi', 'चंदौसी', 'chandausi', 2, true),
    ('Amroha', 'अमरोहा', 'amroha', 3, true),
    ('Bilari', 'बिलारी', 'bilari', 4, true)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
