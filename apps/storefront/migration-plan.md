
src/app/(admin)/admin/login/page.tsx
  49:7  Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.  prefer-shadcn-form
-       <form action={handleLogin} className="space-y-4">
+ <Form>


src/app/(auth)/auth/authenticate/page.tsx
  80:11  Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.  prefer-shadcn-form
-           <form className="" onSubmit={handleSubmit}>
+ <Form>


src/app/(auth)/auth/forgot-password/page.tsx
  53:7  Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.  prefer-shadcn-form
-       <form onSubmit={handleSubmit} className="space-y-4">
+ <Form>


src/app/(auth)/auth/layout.tsx
  17:9  Custom styled <div> detected. Use <Card> from shadcn/ui.  prefer-shadcn-card
-         <div
+ <Card>


src/app/(auth)/auth/otp/page.tsx
  113:9  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-         <button
+ <Button>

  137:9  Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.  prefer-shadcn-form
-         <form className="" onSubmit={handleSubmit}>
+ <Form>


src/app/(auth)/auth/password/page.tsx
  79:9  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-         <button
+ <Button>

  98:9  Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.  prefer-shadcn-form
-         <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
+ <Form>

  118:9  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-         <button onClick={loginByOTP} className="text-sm text-green-600">
+ <Button>


src/app/(auth)/auth/register/page.tsx
  85:9  Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.  prefer-shadcn-form
-         <form onSubmit={handleSubmit} className="space-y-4">
+ <Form>


src/app/(auth)/auth/reset-password/page.tsx
  69:7  Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.  prefer-shadcn-form
-       <form onSubmit={handleSubmit} className="space-y-4">
+ <Form>


src/app/(store)/account/addresses/page.tsx
  132:13  Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.  prefer-shadcn-form
-             <form onSubmit={handleAdd} className="space-y-4">
+ <Form>


src/app/(store)/account/settings/page.tsx
  63:11  Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.  prefer-shadcn-form
-           <form onSubmit={handleSave} className="space-y-4">
+ <Form>


src/app/(store)/contact/page.tsx
  114:13  Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.  prefer-shadcn-form
-             <form onSubmit={handleSubmit} className="space-y-6">
+ <Form>


src/app/(store)/emailauth/forgot-password/page.tsx
  53:7  Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.  prefer-shadcn-form
-       <form onSubmit={handleSubmit} className="space-y-4">
+ <Form>


src/app/(store)/emailauth/login/page.tsx
  51:7  Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.  prefer-shadcn-form
-       <form onSubmit={handleSubmit} className="space-y-4">
+ <Form>


src/app/(store)/emailauth/register/page.tsx
  57:7  Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.  prefer-shadcn-form
-       <form onSubmit={handleSubmit} className="space-y-4">
+ <Form>


src/app/(store)/emailauth/reset-password/page.tsx
  67:7  Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.  prefer-shadcn-form
-       <form onSubmit={handleSubmit} className="space-y-4">
+ <Form>


src/app/(store)/faq/page.tsx
  81:7  Custom styled <div> detected. Use <Card> from shadcn/ui.  prefer-shadcn-card
-       <div className="mt-12 rounded-lg border bg-neutral-50 p-6 text-center">
+ <Card>


src/app/(store)/page-original.tsx
  90:11  Custom styled <div> detected. Use <Card> from shadcn/ui.  prefer-shadcn-card
-           <div className="rounded-lg border bg-white p-6">
+ <Card>

  98:11  Custom styled <div> detected. Use <Card> from shadcn/ui.  prefer-shadcn-card
-           <div className="rounded-lg border bg-white p-6">
+ <Card>

  106:11  Custom styled <div> detected. Use <Card> from shadcn/ui.  prefer-shadcn-card
-           <div className="rounded-lg border bg-white p-6">
+ <Card>

  245:17  Raw <div> with Tailwind aspect ratio class detected. Use <AspectRatio> from shadcn/ui.  prefer-shadcn-aspect-ratio
-                 <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
+ <AspectRatio>


src/app/(store)/search/page.tsx
  31:7  Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.  prefer-shadcn-form
-       <form className="relative mt-8 max-w-lg" action="/search" method="get">
+ <Form>


src/components/admin/sidebar.tsx
  71:9  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-         <button
+ <Button>


src/components/cart/cart-drawer.tsx
  42:13  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-             <button
+ <Button>

  48:13  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-             <button
+ <Button>

  74:13  Raw <div> with overflow scroll/auto class detected. Use <ScrollArea> from shadcn/ui.  prefer-shadcn-scroll-area
-             <div className="flex-1 overflow-y-auto px-4">
+ <ScrollArea>

  95:17  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-                 <button
+ <Button>


src/components/cart/promotion-code-form.tsx
  86:7  Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.  prefer-shadcn-form
-       <form onSubmit={handleAdd} className="flex gap-2">
+ <Form>

  106:15  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-               <button
+ <Button>


src/components/checkout/checkout-address-step.tsx
  80:5  Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.  prefer-shadcn-form
-     <form onSubmit={handleSubmit} className="space-y-6">
+ <Form>


src/components/checkout/checkout-payment-step.tsx
  118:17  Raw <input> detected. Use <Input> from shadcn/ui or wrap in <Field>.  prefer-shadcn-input
-                 <input
+ <Input>

  118:17  Raw <input type="radio"> detected. Use <RadioGroup> from shadcn/ui.  prefer-shadcn-radio-group
-                 <input
+ <RadioGroup>


src/components/checkout/checkout-shipping-step.tsx
  81:17  Raw <input> detected. Use <Input> from shadcn/ui or wrap in <Field>.  prefer-shadcn-input
-                 <input
+ <Input>

  81:17  Raw <input type="radio"> detected. Use <RadioGroup> from shadcn/ui.  prefer-shadcn-radio-group
-                 <input
+ <RadioGroup>


src/components/checkout/payment-provider-input.tsx
  116:7  Custom styled <div> detected. Use <Card> from shadcn/ui.  prefer-shadcn-card
-       <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900">
+ <Card>

  126:7  Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.  prefer-shadcn-form
-       <form action={`http://localhost:3000/payment/${referenceId}`} method="GET">
+ <Form>

  128:9  Raw <input> detected. Use <Input> from shadcn/ui or wrap in <Field>.  prefer-shadcn-input
-         <input type="hidden" value={referenceId} id="RefId" name="RefId" />
+ <Input>


src/components/layout/announcement-bar.tsx
  27:7  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-       <button
+ <Button>


src/components/layout/back-to-top.tsx
  23:5  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-     <button
+ <Button>


src/components/layout/Carousel.tsx
  64:21  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-                     <button
+ <Button>

  82:21  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-                     <button
+ <Button>


src/components/layout/header.tsx
  91:15  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-               <button
+ <Button>

  127:29  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-                             <button
+ <Button>

  184:11  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-           <button
+ <Button>

  248:11  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-           <button
+ <Button>


src/components/layout/newsletter-form.tsx
  24:5  Raw <form> detected. Use <Form> from shadcn/ui with react-hook-form.  prefer-shadcn-form
-     <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-md gap-2">
+ <Form>

  25:7  Raw <input> detected. Use <Input> from shadcn/ui or wrap in <Field>.  prefer-shadcn-input
-       <input
+ <Input>


src/components/products/option-select.tsx
  33:13  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-             <button
+ <Button>


src/components/products/pagination.tsx
  39:5  Raw pagination <nav> detected. Use <Pagination> from shadcn/ui.  prefer-shadcn-pagination
-     <nav
+ <Pagination>


src/components/products/product-card.tsx
  60:7  Raw <div> with Tailwind aspect ratio class detected. Use <AspectRatio> from shadcn/ui.  prefer-shadcn-aspect-ratio
-       <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
+ <AspectRatio>

  76:9  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-         <button
+ <Button>


src/components/products/product-gallery.tsx
  21:7  Raw <div> with Tailwind aspect ratio class detected. Use <AspectRatio> from shadcn/ui.  prefer-shadcn-aspect-ratio
-       <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
+ <AspectRatio>

  36:13  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-             <button
+ <Button>


src/components/products/quantity-selector.tsx
  21:7  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-       <button
+ <Button>

  32:7  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-       <button
+ <Button>


src/components/products/recently-viewed.tsx
  27:7  Raw <div> with overflow scroll/auto class detected. Use <ScrollArea> from shadcn/ui.  prefer-shadcn-scroll-area
-       <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
+ <ScrollArea>


src/components/products/sort-dropdown.tsx
  36:7  Raw <select> detected. Use <Select> from shadcn/ui.  prefer-shadcn-select
-       <select
+ <Select>


src/components/products/variant-selector.tsx
  84:11  Raw <label> with styling className detected. Use <Label> from shadcn/ui.  prefer-shadcn-label
-           <label className="text-sm font-medium">
+ <Label>

  102:17  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-                 <button
+ <Button>

  102:17  Raw <button aria-pressed> detected. Use <Toggle> from shadcn/ui.  prefer-shadcn-toggle
-                 <button
+ <Toggle>


src/components/search/search-modal.tsx
  104:7  Custom modal <div> detected. Use <Dialog> from shadcn/ui.  prefer-shadcn-dialog
-       <div ref={modalRef} className="relative mx-auto mt-[10vh] w-full max-w-2xl px-4" role="dialog" aria-modal="true" aria-label="Search products">
+ <Dialog>

  105:9  Custom styled <div> detected. Use <Card> from shadcn/ui.  prefer-shadcn-card
-         <div className="overflow-hidden rounded-xl bg-white shadow-2xl">
+ <Card>

  109:13  Raw <input> detected. Use <Input> from shadcn/ui or wrap in <Field>.  prefer-shadcn-input
-             <input
+ <Input>

  119:15  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-               <button
+ <Button>

  134:11  Raw <div> with overflow scroll/auto class detected. Use <ScrollArea> from shadcn/ui.  prefer-shadcn-scroll-area
-           <div className="max-h-[60vh] overflow-y-auto">
+ <ScrollArea>

  197:21  Raw <button> detected. Use <Button> from shadcn/ui.  prefer-shadcn-button
-                     <button
+ <Button>


src/puck/blocks/pitch-panel/component.tsx
  22:9  Custom styled <div> detected. Use <Card> from shadcn/ui.  prefer-shadcn-card
-         <div className="rounded-lg border bg-white p-6">
+ <Card>

  30:9  Custom styled <div> detected. Use <Card> from shadcn/ui.  prefer-shadcn-card
-         <div className="rounded-lg border bg-white p-6">
+ <Card>

  38:9  Custom styled <div> detected. Use <Card> from shadcn/ui.  prefer-shadcn-card
-         <div className="rounded-lg border bg-white p-6">
+ <Card>


src/puck/fields/checkbox.tsx
  9:7  Raw <input type="checkbox"> detected. Use <Checkbox> from shadcn/ui.  prefer-shadcn-checkbox
-       <input
+ <Checkbox>

  9:7  Raw <input> detected. Use <Input> from shadcn/ui or wrap in <Field>.  prefer-shadcn-input
-       <input
+ <Input>


src/puck/fields/ImagePickerField.tsx
  86:11  Raw <div> with Tailwind aspect ratio class detected. Use <AspectRatio> from shadcn/ui.  prefer-shadcn-aspect-ratio
-           <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
+ <AspectRatio>
74 findings in 172 files scanned.
