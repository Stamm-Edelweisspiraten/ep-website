import { describe, expect, it } from 'vitest';
import { galleryImageUrl, groupImageUrl, isId, isSlug, officeAvatarUrl, versionOf } from './images';

describe('Bild-URLs', () => {
	it('Galerie', () => {
		expect(galleryImageUrl('g1', 'i1', 'thumb')).toBe('/bilder/galerie/g1/i1/thumb');
		expect(galleryImageUrl('g1', 'i1')).toBe('/bilder/galerie/g1/i1/web');
	});

	it('Amt: ohne Bild null, sonst Proxy-Pfad', () => {
		expect(officeAvatarUrl({ id: 'u1', avatarPath: null })).toBeNull();
		expect(
			officeAvatarUrl({
				id: 'u1',
				avatarPath: '/api/v1/modules/offices/website/offices/holders/u1/avatar'
			})
		).toBe('/bilder/amt/u1');
	});

	it('Gruppe übernimmt ?v=', () => {
		expect(groupImageUrl({ slug: 'meute', imagePath: null })).toBeNull();
		expect(
			groupImageUrl({
				slug: 'meute',
				imagePath: '/api/v1/modules/members/website/groups/meute/image?v=1760000000'
			})
		).toBe('/bilder/gruppe/meute?v=1760000000');
		expect(
			groupImageUrl({
				slug: 'meute',
				imagePath: '/api/v1/modules/members/website/groups/meute/image'
			})
		).toBe('/bilder/gruppe/meute');
	});

	it('ignoriert ungültige Versionen', () => {
		expect(versionOf('/x?v=<script>')).toBeNull();
		expect(versionOf('/x?v=abc-1.2')).toBe('abc-1.2');
		expect(versionOf(null)).toBeNull();
	});

	it('prüft IDs und Slugs', () => {
		expect(isId('0f8fad5b-d9cb-469f-a165-70867728950e')).toBe(true);
		expect(isId('../etc')).toBe(false);
		expect(isId('')).toBe(false);
		expect(isSlug('die-goldenen-loewenzaehne')).toBe(true);
		expect(isSlug('Meute')).toBe(false);
		expect(isSlug('a--b')).toBe(false);
		expect(isSlug('a'.repeat(61))).toBe(false);
	});
});
