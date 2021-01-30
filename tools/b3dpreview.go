package main

import (
	"fmt"
	"os"
	"math"
	"bytes"
	"io/ioutil"
	"encoding/binary"
	"strings"
	"path/filepath"
	// "github.com/davecgh/go-spew/spew"
)

/*

BB3D 7508
	1
	TEXS 85
		2e5c6c65616630325f612e706e67000 10000000200000000000000000000000000803f0000803f00000000
		2e5c7472756e6b30312e6a7067000   10000000200000000000000000000000000803f0000803f00000000
	BRUS 90
		1
		4d6174657269616c303100cdcc4c3fcdcc4c3fcdcc4c3fa4707d3f00000000010000000000000000000000
		4d6174657269616c30320000fffe3e00fffe3e00fffe3e0000803f00000000010000000000000001000000
	NODE 7305
		524f4f54000000000000000000000000800000803f0000803f0000803f0000803f0000000000000000000000804d455348401c0000ffffffff56525453001100000000000001000000020000007ca369c1a04e6542eaacfdc000f15b3ed662943ee4160bbfe05b53423b4b22c1288e9e3ed4450f3c852567c116c95142dcb673c108ccdb3e3cb79e3effb40dbf5cbe5742f7cda0c0ca704c3ea0cc3c3b889f69c1acad5f42bd7e2a3d2c94b23d98b89b3ed90cd5c1309b4f42c3327bc153fdd13ea07e1d3f0a09e1c128456242d8030ec13da06a3e43b6203f9dd5ddc1b2315d421850cebe56dfbb3d5d371e3f9a5312c2309250427afe2dc1b1b1bb3e8b116e3f459812c260975642023188c09de9f33df51d6c3fdb4c20c2488c4d428abebec0bebe643e2fe3803f11c16a4034fd02c1402202bf2b4a1dbf2c613a40bf151a4024335441402202bf2b4a1dbf8bdaff3faae8d93f285b5041d4a314c0791672be8bdaff3f0dff254034fd02c1e76f4ac0791672be2c613a405e93d93fdbd11b42b97d78c02b4a1dbfa2f28a3f65d9993f9f8c1942f9219bc0791672bea2f28a3f735f263fcf955142493cf0c02b4a1dbf5755303ebe3fbb3e4bde5042d55601c1791672be5755303e9c9999be15b35742fc8ffcc02b4a1dbf67ba3dbf4e129a2534fd02c1206888c04afb103e2c613a40067d382590c34e419cbb44c04afb103e8bdaff3f00000000dc9b18422deda7c04afb103ea2f28a3fa202a4be49925042a92805c14afb103e5755303e9c9999be15b35742fc8ffcc04afb103e67ba3dbfaae8d9bf285b5041d4a314c07203053f8bdaff3f0dff25c034fd02c1e76f4ac07203053f2c613a4065d999bf9f8c1942f9219bc07203053fa2f28a3f2dd180bf4bde5042d55601c17203053f5755303e11c16ac034fd02c1402202bffdc7653f2c613a40bf151ac024335441402202bffdc7653f8bdaff3f5e93d9bfdbd11b42b97d78c0fdc7653fa2f28a3feb30a5bfcf955142493cf0c0fdc7653f5755303e9c9999be15b35742fc8ffcc0fdc7653f67ba3dbfaae8d9bf200b58415825a73f2f46a33f8bdaff3f0dff25c034fd02c1bc5e09402f46a33f2c613a4065d999bf1a171e4293b73ac02f46a33fa2f28a3f2dd180bf534d5242e8caddc02f46a33f5755303e96e735a634fd02c114bf4f4088a8d33f2c613a40ebacf7a5b4a2594178aa034088a8d33f8bdaff3f00000000de071f42282121c088a8d33fa2f28a3fa202a4be579952424127d6c088a8d33f5755303e9c9999be15b35742fc8ffcc088a8d33f67ba3dbfaae8d93f200b58415825a73f660502408bdaff3f0dff254034fd02c1bc5e0940660502402c613a4065d9993f1a171e4293b73ac066050240a2f28a3fbe3fbb3e534d5242e8caddc0660502405755303e11c16a4034fd02c1402202bf86361a402c613a40bf151a4024335441402202bf86361a408bdaff3f5e93d93fdbd11b42b97d78c086361a40a2f28a3f735f263fcf955142493cf0c086361a405755303e9c9999be15b35742fc8ffcc086361a4067ba3dbf25b9574128ed62425a4d2bc100f15b3ed662943effb40dbf5cbe5742f7cda0c0288e9e3ed4450f3ca37657418a305e4234c840bf08ccdb3e3cb79e3ee4160bbfe05b53423b4b22c1ca704c3ea0cc3c3bd4f755412ac65142598281c12c94b23d98b89b3ef446cd4148eb5c4231e223be53fdd13ea07e1d3f6c36d8412aad6142661a19c13da06a3e43b6203f5113d441f8325042d52579c156dfbb3d5d371e3f76240e4286ff55423e4591c0b1b1bb3e8b116e3ffbfa0d42389e5042cca733c19de9f33df51d6c3fc5d71b4282bc4b42b53401c1bebe643e2fe3803fa779123f04607042852abe4000f15b3ed662943ed1f32dc0844f5542aeccfbc0288e9e3ed4450f3cf750edc0c0ec63426dd7db4008ccdb3e3cb79e3e42690140446455423392f8c0ca704c3ea0cc3c3b97a6d940de0465421f67e7402c94b23d98b89b3e1d9f03c142e76c42bbf8a14153fdd13ea07e1d3fe77b3fbf481b7a427277a6413da06a3e43b6203f45ecbe4062856e42e74aad4156dfbb3d5d371e3f862a87c080ba7242ed5bfb41b1b1bb3e8b116e3f04f2f73fe03373428f9cfc419de9f33df51d6c3f6dffcdbe322f6f4256db0f42bebe643e2fe3803f8a77c1bff0d9574226a1c4c100f15b3ed662943e42690140446455423392f8c0288e9e3ed4450f3c7f62cf4058cb4b42ae4bb9c108ccdb3e3cb79e3ed1f32dc0844f5542aeccfbc0ca704c3ea0cc3c3be3bcf7c0f2664c425b3fbbc12c94b23d98b89b3e8582e24002893f424cde10c253fdd13ea07e1d3f14bcdabe10034a42bf311cc23da06a3e43b6203fb156e4c0a0053f42fad015c256dfbb3d5d371e3f19b6394034f2334215de3ac2b1b1bb3e8b116e3fa3ba50c0a43534424c4a3bc29de9f33df51d6c3f373e7bbf58402a42534f47c2bebe643e2fe3803f6e56f6c052d27742afcc513e00f15b3ed662943e3a7be8bf5a1e524242ef10c1288e9e3ed4450f3c29ab44c11e9a5c42f79636c008ccdb3e3cb79e3ef987743fe0de54426112bbc0ca704c3ea0cc3c3b638781c0944d66427516d7402c94b23d98b89b3e19479cc11a8c60426148b34053fdd13ea07e1d3f48c47fc1aa887b4223a915413da06a3e43b6203fe7443dc106426a42a5447e4156dfbb3d5d371e3f48bcb5c1348f634271aa7f41b1b1bb3e8b116e3ff82799c15cc367423a06a1419de9f33df51d6c3fe558b3c1d2a25b42071cb341bebe643e2fe3803fc5d0d540667c65426195a9c100f15b3ed662943ef987743fe0de54426112bbc0288e9e3ed4450f3c2daf3541e6a05342b33d55c108ccdb3e3cb79e3e3a7be8bf5a1e524242ef10c1ca704c3ea0cc3c3be31c3e4032d14c42a838b8c12c94b23d98b89b3ed1d393418e8549428c32aac153fdd13ea07e1d3fa9716d41be145a42918fedc13da06a3e43b6203f56f62941c496414287a4fcc156dfbb3d5d371e3f3a23ac413eb43b427258f4c1b1b1bb3e8b116e3ffe118f41a4c038427afc0ac29de9f33df51d6c3f4528a9411a192b423b1309c2bebe643e2fe3803f4ee405418cbc7442f205d1bf00f15b3ed662943e88f1e7bf0ca65442f293c3c0288e9e3ed4450f3cbea96840fad962421d3ec54008ccdb3e3cb79e3edb806c3fb4d951423add15c1ca704c3ea0cc3c3b66ab3e4108e45b42813c6ac02c94b23d98b89b3ecad02441482c6642f797764153fdd13ea07e1d3f13677841863f7842ef800f413da06a3e43b6203febf498410a215f4217fec94056dfbb3d5d371e3fc2669341003663426588a041b1b1bb3e8b116e3f491cb041d83160422bf47c419de9f33df51d6c3f9d33b541225856423630a941bebe643e2fe3803f468b14c1d4736842a6e59bc100f15b3ed662943edb806c3fb4d951423add15c1288e9e3ed4450f3c6bcd96c01e334d42ae8cb4c108ccdb3e3cb79e3e88f1e7bf0ca65442f293c3c0ca704c3ea0cc3c3b018b4dc13e0757423cd44dc12c94b23d98b89b3e144438c1def44342b03ff8c153fdd13ea07e1d3fa8cd84c198835d426b0ce9c13da06a3e43b6203fc897a1c12cc64c421f5fafc156dfbb3d5d371e3fcebc9dc1304a3c42327509c2b1b1bb3e8b116e3f57efb9c1848c40420146f1c19de9f33df51d6c3fe9dbbfc15ca63042bbed02c2bebe643e2fe3803f122a3e4029698242c0350e4000f15b3ed662943eb3d4dcbf5a1e504280c7eec0288e9e3ed4450f3ca40101c01e9a69420ab6924008ccdb3e3cb79e3e002b1d40e0de524256ed02c1ca704c3ea0cc3c3bb7fe2641944d73427cc31c402c94b23d98b89b3eec00253f0dc68042da206a4153fdd13ea07e1d3f0304b64055448e42125d58413da06a3e43b6203f3bec564103a18542a83d554156dfbb3d5d371e3fed15ef409a4786428894b341b1b1bb3e8b116e3f09e24d41ae618842842dac419de9f33df51d6c3f7ce851416951824248f1cb41bebe643e2fe3803fd0fcfec0667c72426204a9c100f15b3ed662943e002b1d40e0de524256ed02c1288e9e3ed4450f3ce1ab973fe6a0604207a3a8c108ccdb3e3cb79e3eb3d4dcbf5a1e504280c7eec0ca704c3ea0cc3c3bb12b37c132d159426b1b97c12c94b23d98b89b3e1f3234c08e856a420c59fec153fdd13ea07e1d3f5b833ec1be147b420e0c04c23da06a3e43b6203fd61f7bc1c4966242bff0f2c156dfbb3d5d371e3fbdfa19c13eb46442aab71dc2b1b1bb3e8b116e3fbd9171c1a4c0614259eb19c29de9f33df51d6c3f212550c11a1954429e1d24c2bebe643e2fe3803f38bb1a4146de8042e0ef47c100f15b3ed662943e827a4d3f0ca65242be54bec0288e9e3ed4450f3c20a95e41fad96f42838d8dc008ccdb3e3cb79e3e20fd13bfb4d94f421c821fc1ca704c3ea0cc3c3bd42c1c4108e4684279a784c12c94b23d98b89b3e1e5bc34124968342df71bcc053fdd13ea07e1d3fd1b2ac41c39f8c4244f75ac13da06a3e43b6203f6b4aa94185108042e11391c156dfbb3d5d371e3fdca80042001b864264682bc1b1b1bb3e8b116e3fe7e9f241ec98844272b47fc19de9f33df51d6c3fc1120d4222587f42ca6f5cc1bebe643e2fe3803f2a996bc1d473754246f1d1c000f15b3ed662943e20fd13bfb4d94f421c821fc1288e9e3ed4450f3c843070c11e335a428e0f41c108ccdb3e3cb79e3e827a4d3f0ca65242be54bec0ca704c3ea0cc3c3bfd1f2ec13e07644200c7c4bd2c94b23d98b89b3e3e04d5c1def46442bfb831c153fdd13ea07e1d3f2eefdcc198837e42caaeb8c03da06a3e43b6203fb152bac12cc66d424867833f56dfbb3d5d371e3fcb8b08c2304a654256afc1c0b1b1bb3e8b116e3f956301c2848c694290935dbf9de9f33df51d6c3f88bc0bc25ca659422c2ac7bfbebe643e2fe3803f92304ac052d26242723b454000f15b3ed662943e548907c05a1e53425bd003c1288e9e3ed4450f3c315209c11e9a474256f6034008ccdb3e3cb79e3e7623d83fe0de5542a3a7cbc0ca704c3ea0cc3c3be2d02f40944d5142fbedf4402c94b23d98b89b3e082440c11a8c3a423c323e4153fdd13ea07e1d3f7ad4e8c0aa88554250415f413da06a3e43b6203fb24865bf0642444236c8924156dfbb3d5d371e3f63b32fc1348f28420c9eb341b1b1bb3e8b116e3fca4bc2c05cc32c42dd00c7419de9f33df51d6c3fb43b03c1d2a2204275e2e141bebe643e2fe3803f347bdb3f667c504204e8b1c100f15b3ed662943e7623d83fe0de5542a3a7cbc0288e9e3ed4450f3c79781141e6a03e42a98e86c108ccdb3e3cb79e3e548907c05a1e53425bd003c1ca704c3ea0cc3c3bc0a61ac032d137429cc7b3c12c94b23d98b89b3ef8b047418e8523428da6ddc153fdd13ea07e1d3fa1eeba40be143442a92408c23da06a3e43b6203fc6809c3fc4961b422f7e08c256dfbb3d5d371e3f95f038413eb400423c9f16c2b1b1bb3e8b116e3fec4bd2404881fb41936b20c29de9f33df51d6c3f65291c413432e041e8c123c2bebe643e2fe3803fa0962e418cbc5f4262679cc000f15b3ed662943e3b6a76bf0ca6554283e2b0c0288e9e3ed4450f3c23a01941fad94d420f70844008ccdb3e3cb79e3e8e7a913eb4d952425f7b19c1ca704c3ea0cc3c3b432e564108e44642623d02c12c94b23d98b89b3ecc4d9a41482c4042d225144153fdd13ea07e1d3f88a2ac41863f52424cbea43f3da06a3e43b6203fc7ccbe410a213942d40624c056dfbb3d5d371e3f11e6e341003628423e3a2241b1b1bb3e8b116e3fd304f141d8312542bf309a409de9f33df51d6c3f6d32034222581b42b4bf1741bebe643e2fe3803f980345c1d47353427acd66c100f15b3ed662943e8e7a913eb4d952425f7b19c1288e9e3ed4450f3c60f314c11e333842386298c108ccdb3e3cb79e3e3b6a76bf0ca6554283e2b0c0ca704c3ea0cc3c3bf51350c13e074242e2faddc02c94b23d98b89b3e418997c1def41d42b5bcc7c153fdd13ea07e1d3fc608b7c198833742a9daa9c13da06a3e43b6203fc1ffbac12cc62642c50653c156dfbb3d5d371e3f6520dfc1304a0142c97dc8c1b1b1bb3e8b116e3ff4efebc1848c05428a819ec19de9f33df51d6c3fea6ef9c1b84ceb418b23afc1bebe643e2fe3803f545249538800000000000000000000000200000001000000030000000000000001000000040000000000000003000000000000000500000002000000060000000500000000000000070000000600000004000000040000000600000000000000060000000800000005000000090000000800000006000000070000000900000006000000090000000a0000000800000054524953a4020000010000000b0000000d0000000c0000000b0000000e0000000d0000000c0000000d0000000f0000000f0000000d000000100000000f00000012000000110000000f00000010000000120000001100000012000000130000000e000000140000000d0000000d00000014000000150000000d00000016000000100000000d0000001500000016000000100000001600000012000000120000001600000017000000120000001700000018000000140000001900000015000000140000001a0000001900000015000000190000001600000016000000190000001b000000160000001c00000017000000160000001b0000001c000000170000001c000000180000001a0000001d00000019000000190000001d0000001e000000190000001f0000001b000000190000001e0000001f0000001b0000001f0000001c0000001c0000001f000000200000001c00000020000000210000001d000000220000001e0000001d00000023000000220000001e000000220000001f0000001f00000022000000240000001f00000025000000200000001f000000240000002500000020000000250000002100000023000000260000002200000022000000260000002700000022000000280000002400000022000000270000002800000024000000280000002500000025000000280000002900000025000000290000002a000000260000002b00000027000000260000002c0000002b000000270000002b00000028000000280000002b0000002d000000280000002e00000029000000280000002d0000002e000000290000002e0000002a0000002c0000002f0000002b0000002b0000002f000000300000002b000000310000002d0000002b00000030000000310000002d000000310000002e0000002e00000031000000320000002e00000032000000330000005452495388000000000000003400000036000000350000003700000034000000350000003800000034000000370000003400000039000000360000003a00000039000000340000003b0000003a00000038000000380000003a000000340000003a0000003c000000390000003d0000003c0000003a0000003b0000003d0000003a0000003d0000003e0000003c000000545249530c010000000000003f0000004100000040000000420000003f00000040000000430000003f000000420000003f000000440000004100000045000000440000003f00000046000000450000004300000043000000450000003f0000004500000047000000440000004800000047000000450000004600000048000000450000004800000049000000470000004a0000004c0000004b0000004d0000004a0000004b0000004e0000004a0000004d0000004a0000004f0000004c000000500000004f0000004a00000051000000500000004e0000004e000000500000004a00000050000000520000004f000000530000005200000050000000510000005300000050000000530000005400000052000000545249531402000000000000550000005700000056000000580000005500000056000000590000005500000058000000550000005a000000570000005b0000005a000000550000005c0000005b00000059000000590000005b000000550000005b0000005d0000005a0000005e0000005d0000005b0000005c0000005e0000005b0000005e0000005f0000005d000000600000006200000061000000630000006000000061000000640000006000000063000000600000006500000062000000660000006500000060000000670000006600000064000000640000006600000060000000660000006800000065000000690000006800000066000000670000006900000066000000690000006a000000680000006b0000006d0000006c0000006e0000006b0000006c0000006f0000006b0000006e0000006b000000700000006d00000071000000700000006b00000072000000710000006f0000006f000000710000006b0000007100000073000000700000007400000073000000710000007200000074000000710000007400000075000000730000007600000078000000770000007900000076000000770000007a0000007600000079000000760000007b000000780000007c0000007b000000760000007d0000007c0000007a0000007a0000007c000000760000007c0000007e0000007b0000007f0000007e0000007c0000007d0000007f0000007c0000007f000000800000007e0000005452495314020000000000008100000083000000820000008400000081000000820000008500000081000000840000008100000086000000830000008700000086000000810000008800000087000000850000008500000087000000810000008700000089000000860000008a0000008900000087000000880000008a000000870000008a0000008b000000890000008c0000008e0000008d0000008f0000008c0000008d000000900000008c0000008f0000008c000000910000008e00000092000000910000008c00000093000000920000009000000090000000920000008c0000009200000094000000910000009500000094000000920000009300000095000000920000009500000096000000940000009700000099000000980000009a00000097000000980000009b000000970000009a000000970000009c000000990000009d0000009c000000970000009e0000009d0000009b0000009b0000009d000000970000009d0000009f0000009c000000a00000009f0000009d0000009e000000a00000009d000000a0000000a10000009f000000a2000000a4000000a3000000a5000000a2000000a3000000a6000000a2000000a5000000a2000000a7000000a4000000a8000000a7000000a2000000a9000000a8000000a6000000a6000000a8000000a2000000a8000000aa000000a7000000ab000000aa000000a8000000a9000000ab000000a8000000ab000000ac000000aa000000545249531402000000000000ad000000af000000ae000000b0000000ad000000ae000000b1000000ad000000b0000000ad000000b2000000af000000b3000000b2000000ad000000b4000000b3000000b1000000b1000000b3000000ad000000b3000000b5000000b2000000b6000000b5000000b3000000b4000000b6000000b3000000b6000000b7000000b5000000b8000000ba000000b9000000bb000000b8000000b9000000bc000000b8000000bb000000b8000000bd000000ba000000be000000bd000000b8000000bf000000be000000bc000000bc000000be000000b8000000be000000c0000000bd000000c1000000c0000000be000000bf000000c1000000be000000c1000000c2000000c0000000c3000000c5000000c4000000c6000000c3000000c4000000c7000000c3000000c6000000c3000000c8000000c5000000c9000000c8000000c3000000ca000000c9000000c7000000c7000000c9000000c3000000c9000000cb000000c8000000cc000000cb000000c9000000ca000000cc000000c9000000cc000000cd000000cb000000ce000000d0000000cf000000d1000000ce000000cf000000d2000000ce000000d1000000ce000000d3000000d0000000d4000000d3000000ce000000d5000000d4000000d2000000d2000000d4000000ce000000d4000000d6000000d3000000d7000000d6000000d4000000d5000000d7000000d4000000d7000000d8000000d6000000414e494d0c000000000000000100000000000000

*/

var le = binary.LittleEndian

type Model struct {
	Version  uint32
	Textures []*Texture
	Brushes  []*Brush
	Root     *Node
}

func (m *Model) Print() {
	fmt.Printf("BB3D v%d, %d textures, %d brushes\n", m.Version, len(m.Textures), len(m.Brushes))
	for i := 0; i < len(m.Textures); i++ {
		fmt.Printf(" * %s\n", m.Textures[i].Path)
	}
	if m.Root != nil {
		m.Root.Print(0)
	}
}

func ParseModel(data []byte) *Model {
	if len(data) < 4+4+4 {
		panic(fmt.Errorf("Data is too small to have minimal b3d model: %d/12", len(data)))
	}

	tag, subdata := nextTag(data)
	data = data[len(subdata)+8:]
	if tag != "BB3D" {
		panic(fmt.Errorf("Main header check failed: %02x", data[0:4]))
	}

	m := &Model{
		Textures: []*Texture{},
		Brushes:  []*Brush{},
	}
	m.parse(subdata)
	return m
}

func (m *Model) parse(data []byte) {
	if len(data) < 4 {
		panic(fmt.Errorf("Data too small: %d/4", len(data)))
	}
	m.Version = le.Uint32(data[0:4])
	data = data[4:]
	if m.Version != 0x01 {
		panic(fmt.Errorf("Unknown B3D header version: %d", m.Version))
	}

	for len(data) != 0 {
		tag, subdata := nextTag(data)
		data = data[len(subdata)+8:]

		switch tag {
		case "TEXS":
			if len(m.Textures) != 0 {
				panic(fmt.Errorf("Duplicate TEXS chunk"))
			}
			m.Textures = ParseTEXSChunk(subdata)
		case "BRUS":
			if len(m.Brushes) != 0 {
				panic(fmt.Errorf("Duplicate BRUS chunk"))
			}
			m.Brushes = ParseBRUSChunk(subdata)
		case "NODE":
			if m.Root != nil {
				panic(fmt.Errorf("Duplicate NODE chunk"))
			}
			m.Root = ParseNODEChunk(subdata)
		default:
			fmt.Printf("Unknown tag inside BB3D: %s\n", tag)
		}
	}
}

type Texture struct {
	Path     string
	Flags    uint32
	Blend    uint32
	PosX     float32
	PosY     float32
	ScaleX   float32
	ScaleY   float32
	Rotation float32
}

func ParseTEXSChunk(data []byte) []*Texture {
	texs := []*Texture{}
	for len(data) != 0 {
		texs = append(texs, &Texture{})
		data = data[texs[len(texs)-1].parse(data):]
	}
	return texs
}

func (t *Texture) parse(data []byte) int {
	startSize := len(data)
	i := bytes.IndexByte(data, 0)
	if i == -1 {
		panic(fmt.Errorf("Expected zero terminated string, found none inside TEXS chunk"))
	}
	t.Path = string(data[:i])
	data = data[i+1:]

	if len(data) < 5*4+2*4 {
		panic(fmt.Errorf("Not enough data for TEXS chunk"))
	}

	t.Flags = le.Uint32(data[0:4])
	t.Blend = le.Uint32(data[4:8])
	data = data[8:]

	t.PosX = math.Float32frombits(le.Uint32(data[0:4]))
	t.PosY = math.Float32frombits(le.Uint32(data[4:8]))
	data = data[8:]
	t.ScaleX = math.Float32frombits(le.Uint32(data[0:4]))
	t.ScaleY = math.Float32frombits(le.Uint32(data[4:8]))
	data = data[8:]
	t.Rotation = math.Float32frombits(le.Uint32(data[0:4]))
	data = data[4:]

	return startSize-len(data)
}

type Brush struct {
	Name       string
	R, G, B, A float32
	Shine      float32
	Blend, Fx  uint32
	Textures   []int
}

func ParseBRUSChunk(data []byte) []*Brush {
	if len(data) < 4 {
		panic(fmt.Errorf("Expected at least 4 bytes here, got %d", len(data)))
	}
	ntexs := int(le.Uint32(data))
	data = data[4:]

	brushes := []*Brush{}
	for len(data) != 0 {
		brushes = append(brushes, &Brush{
			Textures: make([]int, ntexs, ntexs),
		})
		data = data[brushes[len(brushes)-1].parse(data):]
	}
	return brushes
}

func (b *Brush) parse(data []byte) int {
	startSize := len(data)

	i := bytes.IndexByte(data, 0)
	if i == -1 {
		panic(fmt.Errorf("Expected zero terminated string, found none inside BRUS chunk"))
	}
	b.Name = string(data[:i])
	data = data[i+1:]

	if len(data) < 4*4+4+2*4+len(b.Textures)*4 {
		panic(fmt.Errorf("Not enough data for BRUS chunk"))
	}

	b.R = math.Float32frombits(le.Uint32(data[0:4]))
	b.G = math.Float32frombits(le.Uint32(data[4:8]))
	data = data[8:]
	b.B = math.Float32frombits(le.Uint32(data[0:4]))
	b.A = math.Float32frombits(le.Uint32(data[4:8]))
	data = data[8:]
	b.Shine = math.Float32frombits(le.Uint32(data[0:4]))
	data = data[4:]

	b.Blend = le.Uint32(data[0:4])
	b.Fx = le.Uint32(data[4:8])
	data = data[8:]

	for k, _ := range b.Textures {
		b.Textures[k] = int(int32(le.Uint32(data[0:4])))
		data = data[4:]
	}

	return startSize-len(data)
}

type Node struct {
	Name   string
	PosX   float32
	PosY   float32
	PosZ   float32

	ScaleX float32
	ScaleY float32
	ScaleZ float32

	RotationW float32
	RotationX float32
	RotationY float32
	RotationZ float32

	Kind interface{}

	Children []*Node
	Keys     []*Keys

	Animation *Animation
}

type Printable interface {
	Print(depth int)
}

func (n *Node) CountMeshes() int {
	total := 0
	switch n.Kind.(type) {
	case *Mesh:
		total++
	}

	for i := 0; i < len(n.Children); i++ {
		total += n.Children[i].CountMeshes()
	}

	return total
}

func (n *Node) Print(depth int) {
	fmt.Printf("%sNODE %s", strings.Repeat(" ", depth), n.Name)
	if n.Kind == nil {
		fmt.Printf(" PIVOT\n")
	} else {
		fmt.Printf("\n")
		n.Kind.(Printable).Print(depth + 1)
	}

	for i := 0; i < len(n.Children); i++ {
		n.Children[i].Print(depth + 1)
	}
}

func ParseNODEChunk(data []byte) *Node {
	n := &Node{}
	n.parse(data)
	return n
}

func nextTag(data []byte) (string, []byte) {
	tag := string(data[:4])
	size := le.Uint32(data[4:8])
	data = data[8:]
	if int(size) > len(data) {
		panic(fmt.Errorf("Tag data size out of bounds: %d/%d", size, len(data)))
	}
	subdata := data[:size]
	return tag, subdata
}

func (n *Node) parse(data []byte) {
	i := bytes.IndexByte(data, 0)
	if i == -1 {
		panic(fmt.Errorf("Expected zero terminated string, found none inside BRUS chunk"))
	}
	n.Name = string(data[:i])
	data = data[i+1:]

	n.PosX = math.Float32frombits(le.Uint32(data[0:4]))
	n.PosY = math.Float32frombits(le.Uint32(data[4:8]))
	n.PosZ = math.Float32frombits(le.Uint32(data[8:12]))
	data = data[12:]

	n.ScaleX = math.Float32frombits(le.Uint32(data[0:4]))
	n.ScaleY = math.Float32frombits(le.Uint32(data[4:8]))
	n.ScaleZ = math.Float32frombits(le.Uint32(data[8:12]))
	data = data[12:]

	n.RotationW = math.Float32frombits(le.Uint32(data[0:4]))
	n.RotationX = math.Float32frombits(le.Uint32(data[4:8]))
	n.RotationY = math.Float32frombits(le.Uint32(data[8:12]))
	n.RotationZ = math.Float32frombits(le.Uint32(data[12:16]))
	data = data[16:]

	for len(data) != 0 {
		tag, subdata := nextTag(data)
		data = data[len(subdata)+8:]

		switch tag {
		case "MESH":
			if n.Kind != nil {
				panic(fmt.Errorf("Duplicate MESH/BONE on a NODE"))
			}
			n.Kind = ParseMESHChunk(subdata)
		case "BONE":
			if n.Kind != nil {
				panic(fmt.Errorf("Duplicate MESH/BONE on a NODE"))
			}
			n.Kind = ParseBONEChunk(subdata)
		case "ANIM":
			if n.Animation != nil {
				panic(fmt.Errorf("Duplicate ANIM on a NODE"))
			}
			n.Animation = ParseANIMChunk(subdata)
		case "NODE":
			if n.Children == nil {
				n.Children = []*Node{}
			}
			n.Children = append(n.Children, ParseNODEChunk(subdata))
		case "KEYS":
			if n.Keys == nil {
				n.Keys = []*Keys{}
			}
			n.Keys = append(n.Keys, ParseKEYSChunk(subdata))
		default:
			panic(tag)
		}
	}
}

type Key struct {
	Frame    uint32
	Position [3]float32
	Scale    [3]float32
	Rotation [4]float32
}

type Keys struct {
	Flags uint32
	Keys  []Key
}

func ParseKEYSChunk(data []byte) *Keys {
	k := &Keys{
		Flags: le.Uint32(data[0:4]),
	}
	data = data[4:]
	keySize := 1*4
	if (k.Flags & 0x01) != 0 {
		// position
		keySize += 3*4
	}
	if (k.Flags & 0x02) != 0 {
		// scale
		keySize += 3*4
	}
	if (k.Flags & 0x04) != 0 {
		// quaternion
		keySize += 4*4
	}

	if (len(data) % keySize) != 0 {
		panic(fmt.Errorf("Broken alignment for KEYS chunk"))
	}

	k.Keys = make([]Key, len(data) / keySize)
	for i := 0; i < len(k.Keys); i++ {
		key := &k.Keys[i]
		key.Frame = le.Uint32(data[0:4])
		data = data[4:]

		if (k.Flags & 0x01) != 0 {
			key.Position[0] = math.Float32frombits(le.Uint32(data[0:4]))
			key.Position[1] = math.Float32frombits(le.Uint32(data[4:8]))
			key.Position[2] = math.Float32frombits(le.Uint32(data[8:12]))
			data = data[12:]
		}

		if (k.Flags & 0x02) != 0 {
			key.Scale[0] = math.Float32frombits(le.Uint32(data[0:4]))
			key.Scale[1] = math.Float32frombits(le.Uint32(data[4:8]))
			key.Scale[2] = math.Float32frombits(le.Uint32(data[8:12]))
			data = data[12:]
		} else {
			key.Scale[0] = 1.0
			key.Scale[1] = 1.0
			key.Scale[2] = 1.0
		}

		if (k.Flags & 0x04) != 0 {
			key.Rotation[0] = math.Float32frombits(le.Uint32(data[0:4]))
			key.Rotation[1] = math.Float32frombits(le.Uint32(data[4:8]))
			key.Rotation[2] = math.Float32frombits(le.Uint32(data[8:12]))
			key.Rotation[3] = math.Float32frombits(le.Uint32(data[12:16]))
			data = data[16:]
		} else {
			key.Rotation[0] = 1.0
		}
	}

	return k
}

type Animation struct {
	Flags  uint32
	Frames uint32
	FPS    float32
}

func ParseANIMChunk(data []byte) *Animation {
	if len(data) < 12 {
		panic(fmt.Errorf("Not enough data for ANIM chunk: %d/12", len(data)))
	}
	a := &Animation{
		Flags:  le.Uint32(data[0:4]),
		Frames: le.Uint32(data[4:8]),
		FPS:    math.Float32frombits(le.Uint32(data[8:12])),
	}
	if a.FPS == 0.0 {
		a.FPS = 60.0
	}
	return a
}

type Mesh struct {
	Brush     int
	Vertices  *Vertices
	Triangles []*Triangles
}

func (m *Mesh) Print(depth int) {
	fmt.Printf("%sMESH, brush %d\n", strings.Repeat(" ", depth), m.Brush)
}

func ParseMESHChunk(data []byte) *Mesh {
	if len(data) < 4+8+8 {
		panic(fmt.Errorf("Not enough data for a MESH chunk: %d/20", len(data)))
	}

	m := &Mesh{
		Brush:     int(int32(le.Uint32(data[0:4]))),
		Triangles: []*Triangles{},
	}
	data = data[4:]

	// must parse vertices
	{
		tag, subdata := nextTag(data)
		data = data[len(subdata)+8:]

		if tag != "VRTS" {
			panic(fmt.Errorf("Expected VRTS tag inside MESH"))
		}

		m.Vertices = ParseVRTSChunk(subdata)
	}

	for len(data) != 0 {
		tag, subdata := nextTag(data)
		data = data[len(subdata)+8:]

		if tag != "TRIS" {
			panic(fmt.Errorf("Expected TRIS tag inside MESH"))
		}

		m.Triangles = append(m.Triangles, ParseTRISChunk(subdata))
	}

	if len(m.Triangles) < 1 {
		panic(fmt.Errorf("Expected at least one set of triangles inside MESH"))
	}

	return m
}

type Vertices struct {
	Flags    uint32
	Sets     uint32
	SetSize  uint32
	Data     []float32
}

func ParseVRTSChunk(data []byte) *Vertices {
	if len(data) < 12 {
		panic(fmt.Errorf("Expected more data for VRTS chunk, got %d/12", len(data)))
	}

	v := &Vertices{
		Flags:   le.Uint32(data[0:4]),
		Sets:    le.Uint32(data[4:8]),
		SetSize: le.Uint32(data[8:12]),
	}
	data = data[12:]

	floatCount := 3 + int(v.Sets) * int(v.SetSize)
	if (v.Flags & 0x01) != 0 {
		// normals
		floatCount += 3
	}
	if (v.Flags & 0x02) != 0 {
		// color
		floatCount += 4
	}

	if (len(data) % (floatCount * 4)) != 0 {
		panic(fmt.Errorf("Bad amount of data left for vertex data: %d/%d", len(data), floatCount * 4))
	}

	v.Data = make([]float32, len(data)/4)
	for i := 0; i < len(v.Data); i++ {
		v.Data[i] = math.Float32frombits(le.Uint32(data[0:4]))
		data = data[4:]
	}

	return v
}

type Triangles struct {
	Brush int
	Data  []uint32
}

func ParseTRISChunk(data []byte) *Triangles {
	if len(data) < 4 {
		panic(fmt.Errorf("Expected more data for TRIS chunk, got %d/4", len(data)))
	}
	if (len(data) & 0x3) != 0 {
		panic(fmt.Errorf("Misaligned data on a TRIS chunk"))
	}
	t := &Triangles{
		Brush: int(int32(le.Uint32(data[0:4]))),
		Data:  make([]uint32, (len(data)-4) / 4),
	}
	data = data[4:]
	for i := 0; i < len(data); i++ {
		t.Data[i] = le.Uint32(data[0:4])
		data = data[4:]
	}
	return t
}

type Bone struct {
	Vertices []uint32
	Weights  []float32
}

func (b *Bone) Print(depth int) {
	fmt.Printf("%sBONE, %d weights\n", strings.Repeat(" ", depth), len(b.Weights))
}

func ParseBONEChunk(data []byte) *Bone {
	if (len(data) & 0x7) != 0 {
		panic(fmt.Errorf("Misaligned data on a BONE chunk"))
	}
	b := &Bone{
		Vertices: make([]uint32, len(data) / 8),
		Weights:  make([]float32, len(data) / 8),
	}
	for i := 0; i < len(b.Vertices); i++ {
		b.Vertices[i] = le.Uint32(data[0:4])
		b.Weights[i] = math.Float32frombits(le.Uint32(data[4:8]))
		data = data[8:]
	}
	return b
}

func main() {
	files, err := WalkMatch(os.Args[1], "*.b3d")
	check(err)
	for _, path := range files {
		fmt.Println(path)
		file := readBinary(path)
		m := ParseModel(file)
		m.Print()
		if m.Root.CountMeshes() != 1 {
			panic(m.Root.CountMeshes())
		}
		if _, ok := m.Root.Kind.(*Mesh); !ok {
			panic(m.Root.Kind)
		}
	}
	// file := readBinary(os.Args[1])
	// m := ParseModel(file)
	// // // spew.Dump(m)
	// // m.Print()
	// check(filepath.Walk(os.Args[1], func(path string, info os.FileInfo, err error) error {
	// 	if err != nil {
	// 		return err
	// 	}
	// 	if info.IsDir() {
	// 		return nil
	// 	}

	// }))
}

func WalkMatch(root, pattern string) ([]string, error) {
    var matches []string
    err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
        if err != nil {
            return err
        }
        if info.IsDir() {
            return nil
        }
        if matched, err := filepath.Match(pattern, filepath.Base(path)); err != nil {
            return err
        } else if matched {
            matches = append(matches, path)
        }
        return nil
    })
    if err != nil {
        return nil, err
    }
    return matches, nil
}

func readBinary(path string) []byte {
	f, err := os.Open(path)
	check(err)
	defer f.Close()
	d, err := ioutil.ReadAll(f)
	check(err)
	return d
}

func check(err error) {
	if err != nil {
		panic(err)
	}
}
