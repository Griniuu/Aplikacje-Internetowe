<?php
    /** @var $product ?\App\Model\Product */
?>

<div class="form-group">
    <label for="name">Product Name</label>
    <input type="text" id="name" name="product[name]" value="<?= $product ? $product->getName() : '' ?>" required>
</div>

<div class="form-group">
    <label for="description">Description</label>
    <textarea id="description" name="product[description]"><?= $product ? $product->getDescription() : '' ?></textarea>
</div>

<div class="form-group">
    <label for="price">Price ($)</label>
    <input type="number" step="0.01" id="price" name="product[price]" value="<?= $product ? $product->getPrice() : '' ?>" required>
</div>

<div class="form-group">
    <label for="quantity">Quantity</label>
    <input type="number" id="quantity" name="product[quantity]" value="<?= $product ? $product->getQuantity() : 0 ?>" required>
</div>

<div class="form-group">
    <label></label>
    <input type="submit" value="Submit">
</div>
